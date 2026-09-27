import express from "express";
import {
  likePost,
  unlikePost,
  getLikeCount,
  checkLike,
  getPostLikes,
} from "../controllers/like.controller.js";
import { verifyToken, optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:postId", verifyToken, likePost);
router.delete("/:postId", verifyToken, unlikePost);
router.get("/:postId/check", verifyToken, checkLike);
router.get("/:postId/users", optionalAuth, getPostLikes);
router.get("/:postId", optionalAuth, getLikeCount);

export default router;