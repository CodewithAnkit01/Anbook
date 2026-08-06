import express from "express";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowCounts,
} from "../controllers/follow.controller.js";
import {verifyToken} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/follow/:id", verifyToken, followUser);

router.delete("/unfollow/:id", verifyToken, unfollowUser);

router.get("/followers/:id", getFollowers);

router.get("/following/:id", getFollowing);

router.get("/follow/counts/:id", getFollowCounts);

export default router;