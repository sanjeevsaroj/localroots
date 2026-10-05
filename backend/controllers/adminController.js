import mongoose from "mongoose";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// GET /api/admin/products/pending
export const getPendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: "pending" })
    .populate("seller", "name storeName email")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    message: "Pending products fetched successfully",
    data: { products },
  });
});

// PATCH /api/admin/products/:id/approve
export const approveProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.status !== "pending") {
    throw new ApiError(
      400,
      `Product is already ${product.status}`
    );
  }

  product.status = "approved";
  product.rejectionReason = "";

  await product.save();

  res.json({
    success: true,
    message: "Product approved successfully",
    data: { product },
  });
});

// PATCH /api/admin/products/:id/reject
export const rejectProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const { rejectionReason } = req.body;

  if (!rejectionReason || !rejectionReason.trim()) {
    throw new ApiError(400, "Rejection reason is required");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.status !== "pending") {
    throw new ApiError(
      400,
      `Product is already ${product.status}`
    );
  }

  product.status = "rejected";
  product.rejectionReason = rejectionReason.trim();

  await product.save();

  res.json({
    success: true,
    message: "Product rejected successfully",
    data: { product },
  });
});