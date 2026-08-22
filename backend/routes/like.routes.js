import express from "express";

import {
  likePost,
  unlikePost,
  getLikeCount,
  checkLike,
  getPostLikes,
} from "../controllers/like.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();


// Like
router.post(
  "/:postId",
  verifyToken,
  likePost
);


// Unlike
router.delete(
  "/:postId",
  verifyToken,
  unlikePost
);


// Check if current user liked
router.get(
  "/:postId/check",
  verifyToken,
  checkLike
);


// Get users who liked
router.get(
  "/:postId/users",
  getPostLikes
);


// Get like count
router.get(
  "/:postId",
  getLikeCount
);


export default router;