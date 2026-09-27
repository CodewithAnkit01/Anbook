import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Errors with statusCode 400 become JSON responses in the error handler in app.js
const badRequest = (message) => Object.assign(new Error(message), { statusCode: 400 });

const mediaFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "video/mp4",
    "video/webm",
  ];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(badRequest("Only images and videos are allowed."));
};

const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(badRequest("Only JPG, PNG and WebP images are allowed."));
};

// Post media (up to 10 images/videos, 50 MB each)
export const uploadPostMedia = multer({
  storage,
  fileFilter: mediaFilter,
  limits: { files: 10, fileSize: 50 * 1024 * 1024 },
});

// Profile and cover images (one image, 5 MB)
export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { files: 1, fileSize: 5 * 1024 * 1024 },
});

// Default upload middleware (kept for any route that still uses it)
const upload = multer({ storage, fileFilter: mediaFilter });

export default upload;