import express from "express";

import {
  getCustomerStats,
  getMyReviews,
} from "../controllers/customerController.js";

import { authenticateUser, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/stats",
  authenticateUser,
  requireRole("customer"),
  getCustomerStats
);

router.get(
  "/reviews",
  authenticateUser,
  requireRole("customer"),
  getMyReviews
);

export default router;