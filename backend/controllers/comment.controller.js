
import prisma from "../utils/prisma.js";
import { emitNotification } from "../socket/notification.socket.js";
import { getViewablePost } from "../utils/postAccess.js";

const MAX_LENGTH = 500;

const authorSelect = {
  id: true,
  username: true,
  profileImage: true,
  isVerified: true,
};

// Checks the text from the request body.
// Returns { error } or { text }.
const readContent = (content, label) => {
  if (typeof content !== "string" || !content.trim()) {
    return {
      error: `${label} cannot be empty.`,
    };
  }

  if (content.trim().length > MAX_LENGTH) {
    return {
      error: `${label} cannot exceed ${MAX_LENGTH} characters.`,
    };
  }

  return {
    text: content.trim(),
  };
};

// A notification problem must never break the comment itself.
const notify = async (data) => {
  try {
    const notification = await prisma.notification.create({
      data,
    });

    emitNotification(data.recipientId, notification);
  } catch (error) {
    console.error("Comment notification error:", error);
  }
};

// ============================================================
// CREATE COMMENT
// ============================================================

export const createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const { error, text } = readContent(
      req.body.content,
      "Comment"
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    // Check whether the user can view the post.
    const post = await getViewablePost(postId, userId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content: text,
        userId,
        postId,
      },
      include: {
        user: {
          select: authorSelect,
        },
      },
    });

    // Don't notify yourself.
    if (post.userId !== userId) {
      await notify({
        recipientId: post.userId,
        senderId: userId,
        type: "COMMENT",
        postId: post.id,
        commentId: comment.id,
      });
    }

    // Get updated total comment count.
    const commentCount = await prisma.comment.count({
      where: {
        postId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Comment created successfully.",
      comment: {
        ...comment,
        replyCount: 0,
      },
      commentCount,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create comment.",
    });
  }
};

// ============================================================
// GET POST COMMENTS
// ============================================================

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      50
    );

    const skip = (page - 1) * limit;

    // Check whether the post is viewable.
    const post = await getViewablePost(
      postId,
      req.user?.id
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // Only top-level comments.
    const where = {
      postId,
      parentId: null,
    };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,

        orderBy: {
          createdAt: "desc",
        },

        include: {
          user: {
            select: authorSelect,
          },

          _count: {
            select: {
              replies: true,
            },
          },
        },
      }),

      prisma.comment.count({
        where,
      }),
    ]);

    // Convert _count.replies into replyCount.
    const formatted = comments.map(
      ({ _count, ...comment }) => ({
        ...comment,
        replyCount: _count.replies,
      })
    );

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
      },

      comments: formatted,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get comments.",
    });
  }
};

// ============================================================
// UPDATE COMMENT
// ============================================================

export const updateComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { commentId } = req.params;

    const { error, text } = readContent(
      req.body.content,
      "Comment"
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // Only comment owner can edit.
    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments.",
      });
    }

    const updatedComment = await prisma.comment.update({
      where: {
        id: commentId,
      },

      data: {
        content: text,
      },

      include: {
        user: {
          select: authorSelect,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update comment.",
    });
  }
};

// ============================================================
// DELETE COMMENT
// ============================================================

export const deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },

      include: {
        post: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    const isCommentOwner =
      comment.userId === userId;

    const isPostOwner =
      comment.post.userId === userId;

    // Only comment owner OR post owner can delete.
    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this comment.",
      });
    }

    /*
      If this is a top-level comment,
      deleting it also deletes all replies.

      If this is already a reply,
      only that reply is removed.
    */
    const replyCount = comment.parentId
      ? 0
      : await prisma.comment.count({
          where: {
            parentId: commentId,
          },
        });

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
      removedCount: 1 + replyCount,
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete comment.",
    });
  }
};

// ============================================================
// GET COMMENT COUNT
// Counts BOTH comments and replies
// ============================================================

export const getCommentCount = async (req, res) => {
  try {
    const { postId } = req.params;

    // Check whether the post is viewable.
    const post = await getViewablePost(
      postId,
      req.user?.id
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    /*
      This counts:
      - top-level comments
      - replies

      because both have the same postId.
    */
    const commentCount = await prisma.comment.count({
      where: {
        postId,
      },
    });

    return res.status(200).json({
      success: true,
      commentCount,
    });
  } catch (error) {
    console.error("Comment count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get comment count.",
    });
  }
};

// ============================================================
// CREATE REPLY
// ============================================================

export const createReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { commentId } = req.params;

    const { error, text } = readContent(
      req.body.content,
      "Reply"
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    // Find parent comment.
    const parent = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },

      select: {
        id: true,
        parentId: true,
        postId: true,
        userId: true,
      },
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // Check whether the post is viewable.
    const post = await getViewablePost(
      parent.postId,
      userId
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    /*
      One-level reply system.

      If replying to:
        comment -> parentId = comment.id

      If replying to:
        reply -> parentId = original comment.id

      This prevents nested replies.
    */
    const reply = await prisma.comment.create({
      data: {
        content: text,
        userId,
        postId: parent.postId,

        parentId:
          parent.parentId ?? parent.id,
      },

      include: {
        user: {
          select: authorSelect,
        },
      },
    });

    // Don't notify yourself.
    if (parent.userId !== userId) {
      await notify({
        recipientId: parent.userId,
        senderId: userId,
        type: "REPLY",
        postId: parent.postId,
        commentId: reply.id,
      });
    }

    // Updated total count for the post.
    const commentCount = await prisma.comment.count({
      where: {
        postId: parent.postId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Reply created successfully.",
      reply,
      commentCount,
    });
  } catch (error) {
    console.error("Create reply error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create reply.",
    });
  }
};

// ============================================================
// GET COMMENT REPLIES
// ============================================================

export const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    // Find the parent comment.
    const parent = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },

      select: {
        id: true,
        postId: true,
      },
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // Check whether the post is viewable.
    const post = await getViewablePost(
      parent.postId,
      req.user?.id
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    /*
      IMPORTANT FIX:

      We want replies belonging to THIS comment.

      Therefore:
        parentId = commentId

      NOT:
        postId = postId

      There was previously a ReferenceError because
      "postId" was not declared in this function.
    */
    const where = {
      parentId: commentId,
    };

    const [replies, total] = await Promise.all([
      prisma.comment.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          createdAt: "asc",
        },

        include: {
          user: {
            select: authorSelect,
          },
        },
      }),

      // FIXED
      prisma.comment.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
      },

      replies,
    });
  } catch (error) {
    console.error("Get replies error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get replies.",
    });
  }
};
