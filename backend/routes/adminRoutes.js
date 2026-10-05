import express from "express";
import {
  getPendingProducts,
  approveProduct,
  rejectProduct,
} from "../controllers/adminController.js";
import { authenticateUser, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateUser, requireRole("admin"));

router.get("/products/pending", getPendingProducts);
router.patch("/products/:id/approve", approveProduct);
router.patch("/products/:id/reject", rejectProduct);

export default router;