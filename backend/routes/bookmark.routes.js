import express from "express";

import {
  bookmarkPost,
  removeBookmark,
  getBookmarks,
  checkBookmark,
} from "../controllers/bookmark.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  getBookmarks
);
router.get(
  "/:postId/check",
  verifyToken,
  checkBookmark
);
router.post(
  "/:postId",
  verifyToken,
  bookmarkPost
);
router.delete(
  "/:postId",
  verifyToken,
  removeBookmark
);
export default router;