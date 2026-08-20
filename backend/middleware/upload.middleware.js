import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// File validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "video/mp4",
    "video/webm",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed."));
  }
};

// Post media upload
export const uploadPostMedia = multer({
  storage,
  fileFilter,

  limits: {
    files: 10,
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

// Default upload middleware
const upload = multer({
  storage,
  fileFilter,
});

export default upload;