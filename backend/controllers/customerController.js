import Order from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/customer/stats  (customer only)
export const getCustomerStats = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id });

  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length;
  const completedOrders = orders.filter((o) => o.status === "Delivered").length;

  res.json({
    success: true,
    message: "Customer stats fetched successfully",
    data: { totalOrders, activeOrders, completedOrders },
  });
});
