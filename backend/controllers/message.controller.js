import prisma from "../utils/prisma.js";
import { emitNewMessage, emitMessageRead } from "../socket/message.socket.js";

const MAX_LENGTH = 2000;

export const createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: "Receiver ID is required." });
    }
    if (receiverId === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot create a conversation with yourself.",
      });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, username: true, profileImage: true, isVerified: true, isBanned: true },
    });

    if (!receiver) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (receiver.isBanned) {
      return res.status(403).json({ success: false, message: "Cannot message a banned user." });
    }

    const [user1Id, user2Id] = userId < receiverId ? [userId, receiverId] : [receiverId, userId];

    const conversation = await prisma.conversation.upsert({
      where: { user1Id_user2Id: { user1Id, user2Id } },
      update: {},
      create: { user1Id, user2Id },
      include: {
        user1: { select: { id: true, username: true, profileImage: true, isVerified: true } },
        user2: { select: { id: true, username: true, profileImage: true, isVerified: true } },
      },
    });

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({ success: false, message: "Failed to create conversation." });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const skip = (page - 1) * limit;

    const where = { OR: [{ user1Id: userId }, { user2Id: userId }] };

    const conversations = await prisma.conversation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        user1: { select: { id: true, username: true, profileImage: true, isVerified: true } },
        user2: { select: { id: true, username: true, profileImage: true, isVerified: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, content: true, senderId: true, isRead: true, createdAt: true },
        },
      },
    });

    const total = await prisma.conversation.count({ where });

    const formattedConversations = conversations.map((conversation) => {
      const otherUser =
        conversation.user1Id === userId ? conversation.user2 : conversation.user1;
      const lastMessage = conversation.messages[0] || null;

      return {
        id: conversation.id,
        user: otherUser,
        lastMessage,
        isUnread: Boolean(lastMessage && !lastMessage.isRead && lastMessage.senderId !== userId),
        updatedAt: conversation.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ success: false, message: "Failed to get conversations." });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
    const skip = (page - 1) * limit;

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, OR: [{ user1Id: userId }, { user2Id: userId }] },
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }, // newest first; the frontend reverses for display
      include: {
        sender: { select: { id: true, username: true, profileImage: true, isVerified: true } },
      },
    });

    const total = await prisma.message.count({ where: { conversationId } });

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ success: false, message: "Failed to get messages." });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ success: false, message: "Message content is required." });
    }
    if (content.trim().length > MAX_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message cannot exceed ${MAX_LENGTH} characters.`,
      });
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, OR: [{ user1Id: userId }, { user2Id: userId }] },
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    const receiverId =
      conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, isBanned: true },
    });

    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found." });
    }
    if (receiver.isBanned) {
      return res.status(403).json({ success: false, message: "Cannot send message to this user." });
    }

    const message = await prisma.message.create({
      data: { content: content.trim(), senderId: userId, conversationId },
      include: {
        sender: { select: { id: true, username: true, profileImage: true, isVerified: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    try {
      emitNewMessage(receiverId, message);
    } catch (error) {
      console.error("Emit new message error:", error);
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    const conversation = message.conversation;
    const isParticipant = conversation.user1Id === userId || conversation.user2Id === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this conversation.",
      });
    }
    if (message.senderId === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot mark your own message as read.",
      });
    }
    if (message.isRead) {
      return res.status(200).json({ success: true, message });
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    try {
      emitMessageRead(message.senderId, {
        messageId: message.id,
        conversationId: message.conversationId,
        readBy: userId,
        readAt: new Date(),
      });
    } catch (error) {
      console.error("Emit message read error:", error);
    }

    res.status(200).json({ success: true, message: updated });
  } catch (error) {
    console.error("Mark message read error:", error);
    res.status(500).json({ success: false, message: "Failed to mark message as read." });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({ where: { id: messageId } });

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }
    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages.",
      });
    }

    await prisma.message.delete({ where: { id: messageId } });
    res.status(200).json({ success: true, message: "Message deleted successfully." });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ success: false, message: "Failed to delete message." });
  }
};