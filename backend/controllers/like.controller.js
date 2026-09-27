import prisma from "../utils/prisma.js";
import { emitNotification } from "../socket/notification.socket.js";
import { canViewPost } from "../utils/postAccess.js";

// Returns the post only if it exists AND the viewer may see it. It returns
// null in both cases, so a private post's existence is never revealed.
const getViewablePost = async (postId, viewerId) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return null;
  return (await canViewPost(post, viewerId)) ? post : null;
};

export const likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const post = await getViewablePost(postId, userId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    // Idempotent: liking twice (or two fast clicks) is not an error
    let created = false;
    try {
      await prisma.like.create({ data: { userId, postId } });
      created = true;
    } catch (error) {
      if (error.code !== "P2002") throw error; // P2002 = already liked
    }

    // Notify the author, but never for your own post, and never let a
    // notification problem break the like itself.
    if (created && post.userId !== userId) {
      try {
        const notification = await prisma.notification.create({
          data: {
            recipientId: post.userId,
            senderId: userId,
            type: "LIKE",
            postId: post.id,
          },
        });
        emitNotification(post.userId, notification);
      } catch (notificationError) {
        console.error("Like notification error:", notificationError);
      }
    }

    const likeCount = await prisma.like.count({ where: { postId } });

    return res.status(created ? 201 : 200).json({
      success: true,
      message: "Post liked successfully.",
      likeCount,
      isLiked: true,
    });
  } catch (error) {
    console.error("Like post error:", error);
    return res.status(500).json({ success: false, message: "Failed to like post." });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    // deleteMany doesn't throw when nothing matches, so unliking twice is harmless
    await prisma.like.deleteMany({ where: { userId, postId } });

    // Remove the LIKE notification so like/unlike spam can't flood the author
    await prisma.notification.deleteMany({
      where: { type: "LIKE", senderId: userId, postId },
    });

    const likeCount = await prisma.like.count({ where: { postId } });

    return res.status(200).json({
      success: true,
      message: "Post unliked successfully.",
      likeCount,
      isLiked: false,
    });
  } catch (error) {
    console.error("Unlike post error:", error);
    return res.status(500).json({ success: false, message: "Failed to unlike post." });
  }
};

export const getLikeCount = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await getViewablePost(postId, req.user?.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const likeCount = await prisma.like.count({ where: { postId } });
    return res.status(200).json({ success: true, likeCount });
  } catch (error) {
    console.error("Get like count error:", error);
    return res.status(500).json({ success: false, message: "Failed to get like count." });
  }
};

export const checkLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const like = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    return res.status(200).json({ success: true, isLiked: Boolean(like) });
  } catch (error) {
    console.error("Check like error:", error);
    return res.status(500).json({ success: false, message: "Failed to check like." });
  }
};

const LIKES_LIST_LIMIT = 50;

export const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await getViewablePost(postId, req.user?.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const [total, likes] = await Promise.all([
      prisma.like.count({ where: { postId } }),
      prisma.like.findMany({
        where: { postId },
        orderBy: { createdAt: "desc" },
        take: LIKES_LIST_LIMIT,
        include: {
          user: {
            select: { id: true, username: true, profileImage: true, isVerified: true },
          },
        },
      }),
    ]);

    // `total` is the real count, `users` holds the newest 50
    return res.status(200).json({
      success: true,
      total,
      users: likes.map((like) => like.user),
    });
  } catch (error) {
    console.error("Get post likes error:", error);
    return res.status(500).json({ success: false, message: "Failed to get post likes." });
  }
};