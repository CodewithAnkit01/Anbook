import express from "express";
import {
  getMyProfile,
  getUserProfile,
  searchUsers,
  updateProfile,
  updateProfileImage,
  updateCoverImage,
} from "../controllers/user.controller.js";
import { verifyToken, optionalAuth } from "../middleware/auth.middleware.js";
import { uploadImage } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/me", verifyToken, getMyProfile);
router.get("/search", searchUsers);
router.get("/:username",optionalAuth, getUserProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/profile/image", verifyToken, uploadImage.single("profileImage"), updateProfileImage);
router.put("/cover/image", verifyToken, uploadImage.single("coverImage"), updateCoverImage);

export default router;