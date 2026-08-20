// Seeds the database with demo accounts and realistic products.
// Run with: npm run seed (from the backend/ directory)
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";

const PRAYAGRAJ_CENTER = {
  lat: 25.4358,
  lng: 81.8463,
};

// Small deterministic offsets so seeded sellers/products
// land at slightly different nearby coordinates.
function offset(lat, lng, i) {
  return {
    lat: lat + i * 0.01,
    lng: lng + i * 0.008,
  };
}

async function seed() {
  // Check MongoDB URI
  if (!process.env.MONGO_URI) {
    console.error(
      "MONGO_URI is not set — copy backend/.env.example to backend/.env first."
    );
    process.exit(1);
  }

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI);

  console.log("Connected to MongoDB for seeding...");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
  ]);

  console.log("Cleared existing data.");

  // =========================================================
  // DEMO USERS
  // =========================================================

  // Customer
  const customer = await User.create({
    name: "Rahul",
    email: "customer@localroots.com",
    password: "password123",
    phone: "9876500001",
    role: "customer",
    location: {
      city: "Prayagraj",
      latitude: PRAYAGRAJ_CENTER.lat,
      longitude: PRAYAGRAJ_CENTER.lng,
    },
  });

  // Seller 1
  const sellerLoc1 = offset(
    PRAYAGRAJ_CENTER.lat,
    PRAYAGRAJ_CENTER.lng,
    1
  );

  const seller = await User.create({
    name: "Sunita",
    email: "seller@localroots.com",
    password: "password123",
    phone: "9876500002",
    role: "seller",
    storeName: "Sunita's Homemade Foods",
    storeBio:
      "Sunita has been making pickles and papad the traditional way for over 15 years, using recipes passed down from her grandmother.",
    location: {
      city: "Prayagraj",
      latitude: sellerLoc1.lat,
      longitude: sellerLoc1.lng,
    },
  });

  // Seller 2
  const sellerLoc2 = offset(
    PRAYAGRAJ_CENTER.lat,
    PRAYAGRAJ_CENTER.lng,
    2
  );

  const seller2 = await User.create({
    name: "Meena",
    email: "seller2@localroots.com",
    password: "password123",
    phone: "9876500003",
    role: "seller",
    storeName: "Meena's Bake House",
    storeBio:
      "A home baker who turned her love for cakes into a thriving micro-bakery.",
    location: {
      city: "Prayagraj",
      latitude: sellerLoc2.lat,
      longitude: sellerLoc2.lng,
    },
  });

  // =========================================================
  // CARTS
  // =========================================================

  await Promise.all([
    Cart.create({
      user: customer._id,
      items: [],
    }),

    Cart.create({
      user: seller._id,
      items: [],
    }),

    Cart.create({
      user: seller2._id,
      items: [],
    }),
  ]);

  console.log(
    "Created demo users: customer@localroots.com / seller@localroots.com (password123)"
  );

  // =========================================================
  // DEMO PRODUCTS
  // =========================================================

  const productDefs = [
    {
      name: "Homemade Mango Pickle",
      description:
        "Sun-cured mango pickle made the traditional Uttar Pradesh way, with mustard oil, fenugreek and hand-ground spices. No preservatives.",
      price: 220,
      unit: "500g jar",
      category: "pickles",
      stock: 24,
      seller: seller._id,
      images: [
        "https://images.unsplash.com/photo-1589135233689-d56032e9680a?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      loc: sellerLoc1,
    },

    {
      name: "Homemade Papad",
      description:
        "Thin, crispy moong dal papads sun-dried on cotton sheets and hand-rolled. Roast or fry — ready in under two minutes.",
      price: 150,
      unit: "pack of 20",
      category: "pickles",
      stock: 40,
      seller: seller._id,
      images: [
        "https://images.unsplash.com/photo-1776178393323-60eef87af347?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      loc: sellerLoc1,
    },

    {
      name: "Homemade Cookies",
      description:
        "A festive box of six flavours — cardamom, coconut, chocolate chip, jeera, coffee and plain butter — baked in small batches daily.",
      price: 280,
      unit: "box of 18",
      category: "bakery",
      stock: 15,
      seller: seller2._id,
      images: [
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=800&fit=crop",
      ],
      loc: sellerLoc2,
    },

    {
      name: "Handmade Candle",
      description:
        "Hand-poured soy wax candle in small batches, using natural fragrance oils and a reusable ceramic container.",
      price: 320,
      unit: "1 piece",
      category: "candles",
      stock: 18,
      seller: seller._id,
      images: [
        "https://images.unsplash.com/photo-1603005674328-5123ec30fc53?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      loc: sellerLoc1,
    },

    {
      name: "Handmade Pottery",
      description:
        "Functional stoneware mug thrown on the wheel, glazed and fired by hand in a small home pottery studio.",
      price: 450,
      unit: "1 piece",
      category: "pottery",
      stock: 10,
      seller: seller2._id,
      images: [
        "https://images.unsplash.com/photo-1520408222757-6f9f95d87d5d?q=80&w=980&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      loc: sellerLoc2,
    },

    {
      name: "Traditional Gift Box",
      description:
        "A curated assortment of local homemade snacks and sweets, packaged in an eco-friendly gift box — perfect for festivals.",
      price: 599,
      unit: "1 box",
      category: "gifts",
      stock: 12,
      seller: seller._id,
      images: [
        "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&h=800&fit=crop",
      ],
      loc: sellerLoc1,
    },
  ];

  // Insert products into MongoDB
  const products = await Product.insertMany(
    productDefs.map((p) => ({
      name: p.name,
      description: p.description,
      price: p.price,
      unit: p.unit,
      category: p.category,
      stock: p.stock,
      seller: p.seller,
      images: p.images,
      city: "Prayagraj",
      location: {
        type: "Point",
        coordinates: [p.loc.lng, p.loc.lat],
      },
      deliveryAvailable: true,
    }))
  );

  console.log(`Created ${products.length} demo products.`);

  // =========================================================
  // DEMO ORDER
  // =========================================================

  // Create a delivered order so the review flow
  // can be tested immediately.
  const firstProduct = products[0];

  const demoOrder = await Order.create({
    customer: customer._id,

    items: [
      {
        product: firstProduct._id,
        seller: firstProduct.seller,
        productName: firstProduct.name,
        quantity: 2,
        price: firstProduct.price,
        status: "Delivered",
      },
    ],

    deliveryAddress: {
      name: "Rahul",
      phone: "9876500001",
      line1: "12 Civil Lines",
      city: "Prayagraj",
      pincode: "211001",
    },

    subtotal: firstProduct.price * 2,
    deliveryFee: 0,
    totalAmount: firstProduct.price * 2,

    paymentMethod: "COD",
    paymentStatus: "Paid",
    status: "Delivered",
  });

  // =========================================================
  // DEMO REVIEW
  // =========================================================

  await Review.create({
    user: customer._id,
    product: firstProduct._id,
    order: demoOrder._id,
    rating: 5,
    comment: "Tastes exactly like homemade! Will order again.",
  });

  // Update product rating
  await Product.findByIdAndUpdate(firstProduct._id, {
    rating: 5,
    reviewCount: 1,
  });

  console.log("Created a demo delivered order + review.");

  // =========================================================
  // COMPLETE
  // =========================================================

  console.log("\nSeed complete. Demo logins:");

  console.log(
    "  Customer -> customer@localroots.com / password123"
  );

  console.log(
    "  Seller   -> seller@localroots.com / password123"
  );

  console.log(
    "  Seller 2 -> seller2@localroots.com / password123"
  );

  await mongoose.disconnect();

  process.exit(0);
}

// Run seed
seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});