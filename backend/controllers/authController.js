import User from "../models/User.js";
import Cart from "../models/Cart.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateToken } from "../utils/generateToken.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, city, latitude, longitude } =
    req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  if (role && !["customer", "seller"].includes(role)) {
    throw new ApiError(400, "Role must be 'customer' or 'seller'");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || "customer",
    location: {
      city: city || "",
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    },
  });

  await Cart.create({ user: user._id, items: [] });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: user.toSafeObject(),
      token,
    },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const match = await user.comparePassword(password);

  if (!match) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user);

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: user.toSafeObject(),
      token,
    },
  });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Current user",
    data: {
      user: req.user.toSafeObject(),
    },
  });
});

// PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, city } = req.body;

  if (name !== undefined) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new ApiError(400, "Name cannot be empty");
    }

    req.user.name = trimmedName;
  }

  if (phone !== undefined) {
    req.user.phone = phone.trim();
  }

  if (city !== undefined) {
    req.user.location.city = city.trim();
  }

  await req.user.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: req.user.toSafeObject(),
    },
  });
});