import express from "express";

import {
  searchUsers,
  searchPosts,
  searchHashtags,
  search,
} from "../controllers/search.controller.js";

const router = express.Router();


// Unified search
router.get("/", search);


// Users
router.get("/users", searchUsers);


// Posts
router.get("/posts", searchPosts);


// Hashtags
router.get("/hashtags", searchHashtags);


export default router;