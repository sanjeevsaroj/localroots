import express from "express";
import {
  getProducts,
  getNearbyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { createReview, getProductReviews } from "../controllers/reviewController.js";
import { authenticateUser, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Public browsing routes
router.get("/", getProducts);
router.get("/nearby", getNearbyProducts); // must come before /:id so "nearby" isn't parsed as an id
router.get("/:id", getProductById);
router.get("/:id/reviews", getProductReviews);

// Seller-only routes
router.post("/", authenticateUser, requireRole("seller"), upload.array("images", 5), createProduct);
router.put("/:id", authenticateUser, requireRole("seller"), upload.array("images", 5), updateProduct);
router.delete("/:id", authenticateUser, requireRole("seller"), deleteProduct);

// Customer-only route (nested under product for a RESTful shape)
router.post("/:id/reviews", authenticateUser, requireRole("customer"), createReview);

export default router;
