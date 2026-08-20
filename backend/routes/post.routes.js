import express from "express";
import {
  createPost,
  getUserPosts,
  getPostById,
  updatePost,
  deletePost
} from "../controllers/post.controller.js";
const router = express.Router();
import { verifyToken } from "../middleware/auth.middleware.js";

import {
  uploadPostMedia,
} from "../middleware/upload.middleware.js";


router.post(
  "/",
  verifyToken,
  uploadPostMedia.array("media", 10),
  createPost
);

// Get User Posts
router.get(
  "/user/:userId",
  getUserPosts
);


// Get Single Post
router.get(
  "/:id",
  getPostById
);


// Update Post
router.put(
  "/:id",
  verifyToken,
  updatePost
);


// Delete Post
router.delete(
  "/:id",
  verifyToken,
  deletePost
);


export default router;