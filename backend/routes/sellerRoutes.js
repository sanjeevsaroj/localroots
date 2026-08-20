import express from "express";
import { getSellerProducts, getSellerOrdersForDashboard, getSellerStats } from "../controllers/sellerController.js";
import { authenticateUser, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateUser, requireRole("seller"));

router.get("/products", getSellerProducts);
router.get("/orders", getSellerOrdersForDashboard);
router.get("/stats", getSellerStats);

export default router;
