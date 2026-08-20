import express from "express";
import { getCustomerStats } from "../controllers/customerController.js";
import { authenticateUser, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", authenticateUser, requireRole("customer"), getCustomerStats);

export default router;
