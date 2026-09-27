import express from "express";
import { getHashtag, getHashtagPOsts, getTrendingHashtags } from "../controllers/hashtag.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/trending", getTrendingHashtags);
router.get("/:name/posts", optionalAuth, getHashtagPOsts);
router.get("/:name", getHashtag);
export default router;
