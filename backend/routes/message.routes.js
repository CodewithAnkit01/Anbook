import express from "express";

import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
} from "../controllers/message.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();


// Create / get one-to-one conversation
router.post(
  "/conversations",
  verifyToken,
  createConversation
);


// Get my conversations
router.get(
  "/conversations",
  verifyToken,
  getConversations
);


// Get messages from conversation
router.get(
  "/conversations/:conversationId",
  verifyToken,
  getMessages
);


// Send message
router.post(
  "/conversations/:conversationId/messages",
  verifyToken,
  sendMessage
);


// Mark message as read
router.patch(
  "/messages/:messageId/read",
  verifyToken,
  markMessageAsRead
);


// Delete own message
router.delete(
  "/messages/:messageId",
  verifyToken,
  deleteMessage
);

export default router;