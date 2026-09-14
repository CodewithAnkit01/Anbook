import express from "express";
import { getHashtag, getHashtagPOsts, getTrendingHashtags } from "../controllers/hashtag.controller.js";

const router = express.Router();

router.get("/trending", getTrendingHashtags);
router.get("/:name/posts", getHashtagPOsts);
router.get("/:name", getHashtag);
export default router;
