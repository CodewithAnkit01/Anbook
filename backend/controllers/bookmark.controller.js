import prisma from "../utils/prisma.js";
import { getViewablePost } from "../utils/postAccess.js";

export const bookmarkPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const post = await getViewablePost(postId, userId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    // Idempotent: bookmarking twice (or a fast double-click) is not an error
    let bookmark;
    let created = false;
    try {
      bookmark = await prisma.bookmark.create({ data: { userId, postId } });
      created = true;
    } catch (error) {
      if (error.code !== "P2002") throw error; // P2002 = already saved
      bookmark = await prisma.bookmark.findUnique({
        where: { userId_postId: { userId, postId } },
      });
    }

    return res.status(created ? 201 : 200).json({
      success: true,
      message: "Post saved successfully.",
      isSaved: true,
      bookmark,
    });
  } catch (error) {
    console.error("Bookmark post error:", error);
    return res.status(500).json({ success: false, message: "Failed to save post." });
  }
};

export const removeBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    // deleteMany doesn't throw when nothing matches, so removing twice is harmless
    await prisma.bookmark.deleteMany({ where: { userId, postId } });

    return res.status(200).json({
      success: true,
      message: "Post removed from saved posts.",
      isSaved: false,
    });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove saved post." });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    // Over-fetch a little, since some bookmarked posts may need to be filtered out below
    const rows = await prisma.bookmark.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            media: true,
            user: { select: { id: true, username: true, profileImage: true, isVerified: true } },
            _count: { select: { likes: true, comments: true } },
            likes: { where: { userId }, select: { id: true }, take: 1 },
          },
        },
      },
    });

    // Drop bookmarks whose post was deleted, or whose visibility no longer allows this viewer
    const visibleChecks = await Promise.all(
      rows.map((row) => (row.post ? canViewBookmarkedPost(row.post, userId) : false))
    );

    const posts = rows
      .filter((_, index) => visibleChecks[index])
      .map(({ post }) => {
        const { _count, likes, ...rest } = post;
        return {
          ...rest,
          likeCount: _count.likes,
          commentCount: _count.comments,
          isLiked: likes.length > 0,
        };
      });

    const total = await prisma.bookmark.count({ where: { userId } });

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
      posts,
    });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return res.status(500).json({ success: false, message: "Failed to get saved posts." });
  }
};

export const checkBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    return res.status(200).json({ success: true, isSaved: Boolean(bookmark) });
  } catch (error) {
    console.error("Check bookmark error:", error);
    return res.status(500).json({ success: false, message: "Failed to check saved status." });
  }
};

// Re-checks visibility for a post already fetched with `include`, without a second query.
// canViewPost (from postAccess.js) only needs { visibility, userId } and viewerId.
async function canViewBookmarkedPost(post, viewerId) {
  const { canViewPost } = await import("../utils/postAccess.js");
  return canViewPost(post, viewerId);
}