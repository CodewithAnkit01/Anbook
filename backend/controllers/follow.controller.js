import prisma from "../utils/prisma.js";
import { emitNotification } from "../socket/notification.socket.js";

// A notification problem must never break the follow/unfollow itself.
const notify = async (data) => {
  try {
    const notification = await prisma.notification.create({ data });
    emitNotification(data.recipientId, notification);
  } catch (error) {
    console.error("Follow notification error:", error);
  }
};

export const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.id;

    if (followerId === followingId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself.",
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true, isBanned: true },
    });

    if (!targetUser || targetUser.isBanned) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Idempotent: following twice (or a fast double-click) is not an error
    let created = false;
    try {
      await prisma.follow.create({ data: { followerId, followingId } });
      created = true;
    } catch (error) {
      if (error.code !== "P2002") throw error; // P2002 = already following
    }

    if (created) {
      await notify({ recipientId: followingId, senderId: followerId, type: "FOLLOW" });
    }

    const followerCount = await prisma.follow.count({ where: { followingId } });

    return res.status(created ? 201 : 200).json({
      success: true,
      message: "User followed successfully.",
      isFollowing: true,
      followerCount,
    });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ success: false, message: "Failed to follow user." });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.id;

    // deleteMany doesn't throw when nothing matches, so unfollowing twice is harmless
    await prisma.follow.deleteMany({ where: { followerId, followingId } });

    // Remove the FOLLOW notification so follow/unfollow spam can't flood the target
    await prisma.notification.deleteMany({
      where: { type: "FOLLOW", senderId: followerId, recipientId: followingId },
    });

    const followerCount = await prisma.follow.count({ where: { followingId } });

    res.status(200).json({
      success: true,
      message: "User unfollowed successfully.",
      isFollowing: false,
      followerCount,
    });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({ success: false, message: "Failed to unfollow user." });
  }
};

const LIST_LIMIT = 50;

export const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const where = { followingId: id, follower: { isBanned: false } };

    const [total, rows] = await Promise.all([
      prisma.follow.count({ where }),
      prisma.follow.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: LIST_LIMIT,
        include: {
          follower: {
            select: { id: true, username: true, profileImage: true, bio: true, isVerified: true },
          },
        },
      }),
    ]);

    res.status(200).json({ success: true, total, followers: rows.map((f) => f.follower) });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ success: false, message: "Failed to get followers." });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const where = { followerId: id, following: { isBanned: false } };

    const [total, rows] = await Promise.all([
      prisma.follow.count({ where }),
      prisma.follow.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: LIST_LIMIT,
        include: {
          following: {
            select: { id: true, username: true, profileImage: true, bio: true, isVerified: true },
          },
        },
      }),
    ]);

    res.status(200).json({ success: true, total, following: rows.map((f) => f.following) });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ success: false, message: "Failed to get following." });
  }
};

export const getFollowCounts = async (req, res) => {
  try {
    const { id } = req.params;

    const [followers, following] = await Promise.all([
      prisma.follow.count({ where: { followingId: id } }),
      prisma.follow.count({ where: { followerId: id } }),
    ]);

    res.status(200).json({ success: true, followers, following });
  } catch (error) {
    console.error("Get follow counts error:", error);
    res.status(500).json({ success: false, message: "Failed to get follow counts." });
  }
};