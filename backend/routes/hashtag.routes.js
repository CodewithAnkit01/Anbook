import { getHashtag, getHashtagPOsts, getTrendingHashtags } from "../controllers/hashtag.controller.js";
import express from express;
const router = express.Router();

router.get("/trending", getTrendingHashtags);
router.get("/:name/posts", getHashtagPosts);
router.get("/:name", getHashtag);
export default router;
