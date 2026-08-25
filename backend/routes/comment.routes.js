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

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();


// Create comment
router.post(
  "/:postId",
  verifyToken,
  createComment
);


// Comment count
router.get(
  "/:postId/count",
  getCommentCount
);


// Get post comments
router.get(
  "/:postId",
  getPostComments
);


// Create reply
router.post(
  "/:commentId/reply",
  verifyToken,
  createReply
);


// Get replies
router.get(
  "/:commentId/replies",
  getCommentReplies
);


// Update comment/reply
router.put(
  "/:commentId",
  verifyToken,
  updateComment
);


// Delete comment/reply
router.delete(
  "/:commentId",
  verifyToken,
  deleteComment
);

export default router;