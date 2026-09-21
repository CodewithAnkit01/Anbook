import helmet from "helmet";
import rateLimit from "express-rate-limit";


// ==========================================
// HELMET
// ==========================================

export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});


// ==========================================
// GLOBAL RATE LIMIT
// ==========================================

export const globalRateLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes

    max: 300,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many requests. Please try again later.",
    },
  });


// ==========================================
// AUTH RATE LIMIT
// ==========================================

export const authRateLimiter =
  rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 10,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many authentication attempts. Please try again later.",
    },
  });


// ==========================================
// MESSAGE RATE LIMIT
// ==========================================

export const messageRateLimiter =
  rateLimit({
    windowMs: 60 * 1000,

    max: 60,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many messages. Please slow down.",
    },
  });