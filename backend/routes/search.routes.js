import express from "express";

import {
  searchUsers,
  searchPosts,
  searchHashtags,
  search,
} from "../controllers/search.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();


router.get("/", optionalAuth, search);
router.get("/users", searchUsers);
router.get("/posts", optionalAuth, searchPosts);
router.get("/hashtags", searchHashtags);


export default router;