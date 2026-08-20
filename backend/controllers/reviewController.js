import mongoose from "mongoose";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// Recalculates and persists a product's average rating + review count
async function refreshProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const { avgRating = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: count,
  });
}

// POST /api/products/:id/reviews  (customer only)
// Body: { rating, comment, orderId }
export const createReview = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const { rating, comment, orderId } = req.body;

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product id");
  }
  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }
  if (!comment || !comment.trim()) {
    throw new ApiError(400, "Comment is required");
  }
  if (!orderId || !mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "A valid orderId is required to prove purchase");
  }

  const order = await Order.findOne({ _id: orderId, customer: req.user._id });
  if (!order) {
    throw new ApiError(404, "Order not found for this customer");
  }

  const orderItem = order.items.find((i) => i.product.toString() === productId);
  if (!orderItem) {
    throw new ApiError(400, "This product was not part of that order");
  }
  if (orderItem.status !== "Delivered") {
    throw new ApiError(400, "You can only review products after they have been delivered");
  }

  const existing = await Review.findOne({ user: req.user._id, product: productId, order: orderId });
  if (existing) {
    throw new ApiError(409, "You have already reviewed this product for this order");
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    order: orderId,
    rating,
    comment: comment.trim(),
  });

  await refreshProductRating(productId);

  res.status(201).json({ success: true, message: "Review submitted successfully", data: { review } });
});

// GET /api/products/:id/reviews
export const getProductReviews = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const reviews = await Review.find({ product: productId })
    .sort({ createdAt: -1 })
    .populate("user", "name profileImage");

  res.json({ success: true, message: "Reviews fetched successfully", data: { reviews } });
});
