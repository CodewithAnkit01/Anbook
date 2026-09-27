import express from "express";
import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  getCommentCount,
  createReply,
  getCommentReplies,
} from "../controllers/comment.controller.js";
import { verifyToken, optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:postId", verifyToken, createComment);
router.get("/:postId/count", optionalAuth, getCommentCount);
router.get("/:postId", optionalAuth, getPostComments);
router.post("/:commentId/reply", verifyToken, createReply);
router.get("/:commentId/replies", optionalAuth, getCommentReplies);
router.put("/:commentId", verifyToken, updateComment);
router.delete("/:commentId", verifyToken, deleteComment);

export default router;