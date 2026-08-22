import express from "express";

import {
  getFeed,
} from "../controllers/feed.controller.js";

import {
  verifyToken,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  getFeed
);

export default router;