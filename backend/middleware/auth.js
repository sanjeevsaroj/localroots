import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Verifies the Bearer token and attaches the authenticated user to req.user
export const authenticateUser = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, "Not authorized — no token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Not authorized — invalid or expired token");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, "Not authorized — user no longer exists");
  }

  req.user = user;
  next();
});

// Restricts a route to one or more roles, e.g. requireRole("seller")
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Not authorized");
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Access denied — requires role: ${roles.join(" or ")}`);
    }
    next();
  };
}
