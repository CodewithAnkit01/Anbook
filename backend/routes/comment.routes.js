import express from "express";

import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  getCommentCount,
} from "../controllers/comment.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();


// Create comment
router.post(
  "/:postId",
  verifyToken,
  createComment
);


// Get comments
router.get(
  "/:postId",
  getPostComments
);


// Comment count
router.get(
  "/:postId/count",
  getCommentCount
);


// Update comment
router.put(
  "/:commentId",
  verifyToken,
  updateComment
);


// Delete comment
router.delete(
  "/:commentId",
  verifyToken,
  deleteComment
);

export default router;