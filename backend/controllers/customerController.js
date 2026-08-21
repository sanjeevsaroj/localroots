import Order from "../models/Order.js";
import Review from "../models/Review.js";

import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/customer/stats
export const getCustomerStats = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id });

  const totalOrders = orders.length;
  const activeOrders = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled"
  ).length;
  const completedOrders = orders.filter(
    (o) => o.status === "Delivered"
  ).length;

  res.json({
    success: true,
    message: "Customer stats fetched successfully",
    data: { totalOrders, activeOrders, completedOrders },
  });
});

// GET /api/customer/reviews
export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("user", "name profileImage")
    .populate("product", "name image images");

  res.json({
    success: true,
    message: "My reviews fetched successfully",
    data: { reviews },
  });
});