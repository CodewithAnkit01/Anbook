import express from "express";
const router = express.Router();

import { getMyProfile, getUserProfile, searchUsers, updateProfile,updateProfileImage ,updateCoverImage } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

    router.get("/me",verifyToken, getMyProfile)
    router.get("/search", searchUsers);
    router.get("/:username", getUserProfile)
    router.put("/profile", verifyToken, updateProfile);

router.put(
  "/profile/image",
  verifyToken,
  upload.single("profileImage"),
  updateProfileImage
);

router.put(
  "/cover/image",
  verifyToken,
  upload.single("coverImage"),
  updateCoverImage
);


export default router;