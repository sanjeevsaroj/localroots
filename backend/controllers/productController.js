import mongoose from "mongoose";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { fileToImageRecord } from "../middleware/upload.js";

// GET /api/products
// Supports: ?search=&category=&city=&minPrice=&maxPrice=&page=&limit=
export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, city, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (search) {
    filter.$text = { $search: search };
  }
  if (category) {
    filter.category = category.toLowerCase();
  }
  if (city) {
    filter.city = new RegExp(`^${city}$`, "i");
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("seller", "name storeName location.city")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "Products fetched successfully",
    data: {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

// GET /api/products/nearby?lat=&lng=&radius=(km)
export const getNearbyProducts = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5, category } = req.query;

  if (!lat || !lng) {
    throw new ApiError(400, "lat and lng query parameters are required");
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  const radiusMeters = Number(radius) * 1000;

  const geoFilter = {
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: radiusMeters,
      },
    },
  };
  if (category) geoFilter.category = category.toLowerCase();

  const products = await Product.find(geoFilter)
    .populate("seller", "name storeName")
    .limit(100);

  // Attach a human-readable distance (km) from the customer to each product
  const withDistance = products.map((p) => {
    const [plng, plat] = p.location.coordinates;
    const distanceKm = haversineKm(latitude, longitude, plat, plng);
    return { ...p.toObject(), distance: Math.round(distanceKm * 10) / 10 };
  });

  res.json({
    success: true,
    message: "Nearby products fetched successfully",
    data: { products: withDistance },
  });
});

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET /api/products/:id
export const getProductById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findById(req.params.id).populate(
    "seller",
    "name storeName storeBio location.city profileImage createdAt"
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.json({ success: true, message: "Product fetched successfully", data: { product } });
});

// POST /api/products  (seller only, multipart/form-data)
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, unit, category, stock, city, latitude, longitude, deliveryAvailable } =
    req.body;

  if (!name || !description || !price || !category) {
    throw new ApiError(400, "name, description, price and category are required");
  }

  let images = [];
  let imagePublicIds = [];

  if (req.files && req.files.length > 0) {
    const records = req.files.map(fileToImageRecord);
    images = records.map((r) => r.url);
    imagePublicIds = records.map((r) => r.publicId);
  } else if (req.body.images) {
    // Allow passing image URLs directly (useful for seed data / no-file flows)
    images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
  }

  if (images.length === 0) {
    throw new ApiError(400, "At least one product image is required");
  }

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    unit: unit || "1 piece",
    category,
    stock: stock !== undefined ? Number(stock) : 0,
    images,
    imagePublicIds,
    city: city || req.user.location?.city || "",
    location: {
      type: "Point",
      coordinates: [
        longitude !== undefined ? Number(longitude) : req.user.location?.longitude || 0,
        latitude !== undefined ? Number(latitude) : req.user.location?.latitude || 0,
      ],
    },
    deliveryAvailable: deliveryAvailable === undefined ? true : deliveryAvailable === "true" || deliveryAvailable === true,
    seller: req.user._id,
  });

  res.status(201).json({ success: true, message: "Product created successfully", data: { product } });
});

// PUT /api/products/:id  (seller only, must own the product)
export const updateProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  if (product.seller.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own products");
  }

  const editableFields = ["name", "description", "price", "unit", "category", "stock", "city", "deliveryAvailable"];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = field === "price" || field === "stock" ? Number(req.body[field]) : req.body[field];
    }
  });

  if (req.body.latitude !== undefined || req.body.longitude !== undefined) {
    product.location.coordinates = [
      req.body.longitude !== undefined ? Number(req.body.longitude) : product.location.coordinates[0],
      req.body.latitude !== undefined ? Number(req.body.latitude) : product.location.coordinates[1],
    ];
  }

  if (req.files && req.files.length > 0) {
    const records = req.files.map(fileToImageRecord);
    product.images = records.map((r) => r.url);
    product.imagePublicIds = records.map((r) => r.publicId);
  }

  await product.save();

  res.json({ success: true, message: "Product updated successfully", data: { product } });
});

// DELETE /api/products/:id  (seller only, must own the product)
export const deleteProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  if (product.seller.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own products");
  }

  await product.deleteOne();

  res.json({ success: true, message: "Product deleted successfully", data: {} });
});
