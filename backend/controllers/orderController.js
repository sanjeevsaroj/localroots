import mongoose from "mongoose";
import Order, { ALL_ORDER_STATUSES, ORDER_STATUS_FLOW } from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 500;

// POST /api/orders  (customer only)
// Body: { deliveryAddress: { name, phone, address(line1), city, pincode }, paymentMethod }
export const placeOrder = asyncHandler(async (req, res) => {
  const { deliveryAddress, paymentMethod } = req.body;

  if (!deliveryAddress || !deliveryAddress.name || !deliveryAddress.phone || !deliveryAddress.city) {
    throw new ApiError(400, "A complete delivery address is required");
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  // Re-validate every item against the live database — never trust cart price snapshots or client totals.
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product) {
      throw new ApiError(400, "One of the items in your cart no longer exists");
    }
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for "${product.name}" (only ${product.stock} left)`);
    }
    orderItems.push({
      product: product._id,
      seller: product.seller,
      productName: product.name,
      quantity: item.quantity,
      price: product.price, // authoritative price from DB, not from client/cart snapshot
      status: "Pending",
    });
    subtotal += product.price * item.quantity;
  }

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const totalAmount = subtotal + deliveryFee;

  // NOTE: MongoDB multi-document transactions require a replica set, which a default
  // standalone `mongodb://127.0.0.1:27017` instance is not. To keep this working out of the
  // box (per the setup instructions), stock is decremented with atomic per-document
  // findOneAndUpdate guards instead of a transaction, with manual rollback if a later
  // item fails. If you deploy against a replica set / Atlas, this can be upgraded to a
  // session-based transaction for full atomicity across documents.
  const decremented = [];
  try {
    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) {
        throw new ApiError(400, `"${item.productName}" went out of stock, please update your cart`);
      }
      decremented.push(item);
    }

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      deliveryAddress: {
        name: deliveryAddress.name,
        phone: deliveryAddress.phone,
        line1: deliveryAddress.address || deliveryAddress.line1 || "",
        city: deliveryAddress.city,
        pincode: deliveryAddress.pincode || "",
      },
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: paymentMethod === "online" || paymentMethod === "DEMO_ONLINE" ? "DEMO_ONLINE" : "COD",
      paymentStatus: "Pending",
      status: "Pending",
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, message: "Order placed successfully", data: { order } });
  } catch (err) {
    // Roll back any stock we already decremented before the failure
    for (const item of decremented) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
    throw err;
  }
});

// GET /api/orders/my-orders  (customer only)
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .sort({ createdAt: -1 })
    .populate("items.product", "name images");

  res.json({ success: true, message: "Orders fetched successfully", data: { orders } });
});

// GET /api/orders/:id  (owner customer, or a seller who has an item in the order)
export const getOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid order id");
  }

  const order = await Order.findById(req.params.id).populate("items.product", "name images");
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const isOwner = order.customer.toString() === req.user._id.toString();
  const isInvolvedSeller = order.items.some((i) => i.seller.toString() === req.user._id.toString());

  if (!isOwner && !isInvolvedSeller) {
    throw new ApiError(403, "You do not have access to this order");
  }

  res.json({ success: true, message: "Order fetched successfully", data: { order } });
});

// GET /api/orders/seller  (seller only) — orders containing at least one of this seller's items
export const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ "items.seller": req.user._id })
    .sort({ createdAt: -1 })
    .populate("customer", "name phone")
    .populate("items.product", "name images");

  // Trim to only this seller's line items so a seller never sees another seller's prices/products
  const scoped = orders.map((order) => {
    const obj = order.toObject();
    obj.items = obj.items.filter((i) => i.seller.toString() === req.user._id.toString());
    return obj;
  });

  res.json({ success: true, message: "Seller orders fetched successfully", data: { orders: scoped } });
});

// PATCH /api/orders/:id/status  (seller only, must own at least one item in the order)
// Body: { status } — applies to this seller's items within the order; overall order.status
// is recalculated as the "earliest" stage among all items.
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid order id");
  }
  if (!ALL_ORDER_STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${ALL_ORDER_STATUSES.join(", ")}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const sellerItems = order.items.filter((i) => i.seller.toString() === req.user._id.toString());
  if (sellerItems.length === 0) {
    throw new ApiError(403, "You do not have any items in this order");
  }

  sellerItems.forEach((item) => {
    item.status = status;
  });

  // Recompute overall status as the least-advanced status among all items (Cancelled items excluded)
  const activeStatuses = order.items.map((i) => i.status).filter((s) => s !== "Cancelled");
  if (activeStatuses.length === 0) {
    order.status = "Cancelled";
  } else {
    const earliestIndex = Math.min(...activeStatuses.map((s) => ORDER_STATUS_FLOW.indexOf(s)));
    order.status = ORDER_STATUS_FLOW[earliestIndex];
  }

  await order.save();

  res.json({ success: true, message: "Order status updated successfully", data: { order } });
});
