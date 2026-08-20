import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/seller/products  (seller only) — products owned by the logged-in seller
export const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, message: "Seller products fetched successfully", data: { products } });
});

// GET /api/seller/orders  (seller only) — alias of /api/orders/seller, kept for the dashboard route group
export const getSellerOrdersForDashboard = asyncHandler(async (req, res) => {
  const orders = await Order.find({ "items.seller": req.user._id })
    .sort({ createdAt: -1 })
    .populate("customer", "name phone")
    .populate("items.product", "name images");

  const scoped = orders.map((order) => {
    const obj = order.toObject();
    obj.items = obj.items.filter((i) => i.seller.toString() === req.user._id.toString());
    return obj;
  });

  res.json({ success: true, message: "Seller orders fetched successfully", data: { orders: scoped } });
});

// GET /api/seller/stats  (seller only)
export const getSellerStats = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const [totalProducts, orders] = await Promise.all([
    Product.countDocuments({ seller: sellerId }),
    Order.find({ "items.seller": sellerId }),
  ]);

  let totalOrders = 0;
  let pendingOrders = 0;
  let totalRevenue = 0;

  orders.forEach((order) => {
    const myItems = order.items.filter((i) => i.seller.toString() === sellerId.toString());
    if (myItems.length === 0) return;
    totalOrders += 1;
    if (myItems.some((i) => i.status === "Pending")) pendingOrders += 1;
    myItems.forEach((i) => {
      if (i.status === "Delivered") totalRevenue += i.price * i.quantity;
    });
  });

  res.json({
    success: true,
    message: "Seller stats fetched successfully",
    data: {
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
    },
  });
});
