import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

function serializeCart(cart) {
  const items = cart.items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
    price: item.price,
  }));
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, cartTotal, cartCount };
}

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate("items.product");

  res.json({ success: true, message: "Cart fetched successfully", data: serializeCart(cart) });
});

// POST /api/cart/items  { productId, quantity }
export const addCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId || !mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Valid productId is required");
  }
  const qty = Number(quantity);
  if (!qty || qty < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  if (product.stock < qty) {
    throw new ApiError(400, `Only ${product.stock} in stock`);
  }

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((i) => i.product.toString() === productId);

  if (existing) {
    existing.quantity += qty;
    existing.price = product.price;
  } else {
    cart.items.push({ product: product._id, quantity: qty, price: product.price });
  }

  await cart.save();
  await cart.populate("items.product");

  res.status(201).json({ success: true, message: "Item added to cart", data: serializeCart(cart) });
});

// PUT /api/cart/items/:productId  { quantity }
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid productId");
  }
  const qty = Number(quantity);
  if (qty === undefined || Number.isNaN(qty)) {
    throw new ApiError(400, "quantity is required");
  }

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) {
    throw new ApiError(404, "Item not found in cart");
  }

  if (qty <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  } else {
    const product = await Product.findById(productId);
    if (product && product.stock < qty) {
      throw new ApiError(400, `Only ${product.stock} in stock`);
    }
    item.quantity = qty;
  }

  await cart.save();
  await cart.populate("items.product");

  res.json({ success: true, message: "Cart updated successfully", data: serializeCart(cart) });
});

// DELETE /api/cart/items/:productId
export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid productId");
  }

  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();
  await cart.populate("items.product");

  res.json({ success: true, message: "Item removed from cart", data: serializeCart(cart) });
});

// DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();

  res.json({ success: true, message: "Cart cleared", data: serializeCart(cart) });
});
