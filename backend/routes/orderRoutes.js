import express from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authenticateUser, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateUser);

router.post("/", requireRole("customer"), placeOrder);
router.get("/my-orders", requireRole("customer"), getMyOrders);
router.get("/seller", requireRole("seller"), getSellerOrders);
router.patch("/:id/status", requireRole("seller"), updateOrderStatus);
router.get("/:id", getOrderById); // ownership/authorization checked inside the controller

export default router;
