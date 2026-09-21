import express from "express";
const router = express.Router();
import { register, login } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  authRateLimiter,
} from "../middleware/security.middleware.js";

    router.post("/register", authRateLimiter, register)
    router.post("/login",authRateLimiter, login)


export default router;