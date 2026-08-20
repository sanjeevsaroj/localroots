import express from "express";
import { getCart, addCartItem, updateCartItem, removeCartItem, clearCart } from "../controllers/cartController.js";
import { authenticateUser, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Cart is a customer-facing feature
router.use(authenticateUser, requireRole("customer"));

router.get("/", getCart);
router.post("/items", addCartItem);
router.put("/items/:productId", updateCartItem);
router.delete("/items/:productId", removeCartItem);
router.delete("/", clearCart);

export default router;
