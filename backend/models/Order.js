import mongoose from "mongoose";

export const ORDER_STATUS_FLOW = ["Pending", "Accepted", "Preparing", "Ready", "Delivered"];
export const ALL_ORDER_STATUSES = [...ORDER_STATUS_FLOW, "Cancelled"];

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number, // unit price at time of order (server-calculated, never trusted from client)
      required: true,
    },
    // Per-line-item status lets a seller update only the items they own within a mixed-seller order.
    status: {
      type: String,
      enum: ALL_ORDER_STATUSES,
      default: "Pending",
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must contain at least one item",
      },
    },
    deliveryAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      line1: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, default: "" },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "DEMO_ONLINE"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    // Overall order status — mirrors the "lowest" item status across the order for simple display.
    status: {
      type: String,
      enum: ALL_ORDER_STATUSES,
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
