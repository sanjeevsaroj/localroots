import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

let storage;

if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "localroots/products",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1200, height: 1200, crop: "limit" }],
    },
  });
} else {
  // Local dev fallback: store files on disk under backend/uploads and serve them
  // statically from /uploads (wired up in app.js). Keeps the rest of the app working
  // without Cloudinary credentials.
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});

// Normalizes a multer file object (Cloudinary vs local disk) into a { url, publicId } pair
export function fileToImageRecord(file) {
  if (isCloudinaryConfigured) {
    return { url: file.path, publicId: file.filename };
  }
  return { url: `/uploads/${file.filename}`, publicId: "" };
}

export { UPLOAD_DIR };
