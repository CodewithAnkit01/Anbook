export const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
];
export const MAX_FILES = 10;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
// Profile and cover images: images only, smaller limit (mirrors uploadImage in the backend)
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB