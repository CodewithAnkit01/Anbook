import express from "express";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();


// Get notifications
router.get(
  "/",
  verifyToken,
  getNotifications
);


// Unread count
router.get(
  "/unread-count",
  verifyToken,
  getUnreadCount
);


// Mark all as read
router.patch(
  "/read-all",
  verifyToken,
  markAllAsRead
);


// Mark one as read
router.patch(
  "/:id/read",
  verifyToken,
  markAsRead
);


// Delete notification
router.delete(
  "/:id",
  verifyToken,
  deleteNotification
);


export default router;