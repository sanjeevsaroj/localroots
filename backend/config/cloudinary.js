import { v2 as cloudinary } from "cloudinary";

export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn(
    "Cloudinary credentials not found in .env — using local disk storage fallback for uploaded images " +
      "(saved to backend/uploads and served from /uploads). Add Cloudinary credentials to enable cloud storage."
  );
}

export default cloudinary;
