import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    unit: {
      type: String,
      default: "1 piece",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      lowercase: true,
      trim: true,
    },
    // First image is treated as the primary/cover image (mirrors frontend's `image` field)
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one product image is required",
      },
    },
    imagePublicIds: {
      type: [String],
      default: [], // Cloudinary public_ids, parallel array to images, used for deletion
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    deliveryAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ location: "2dsphere" });
productSchema.index({ name: "text", description: "text" });

// Convenience virtual so the API can mirror the frontend mock shape (`image` = cover photo)
productSchema.virtual("image").get(function getCoverImage() {
  return this.images && this.images.length > 0 ? this.images[0] : "";
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export default mongoose.model("Product", productSchema);
