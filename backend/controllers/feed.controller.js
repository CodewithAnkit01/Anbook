
import prisma from "../utils/prisma.js";

export const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;

    // Pagination
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    // Get users that current user follows
    const following = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },

      select: {
        followingId: true,
      },
    });

    const followingIds = following.map(
      (follow) => follow.followingId
    );

    /*
      FEED VISIBILITY LOGIC

      PUBLIC
      → Everyone can see

      FOLLOWERS
      → Only followers can see

      PRIVATE
      → Only post owner can see
    */

    const where = {
      OR: [
        // 1. PUBLIC posts
        {
          visibility: "PUBLIC",
        },

        // 2. My own posts
        {
          userId: userId,
        },

        // 3. FOLLOWERS posts from users I follow
        {
          visibility: "FOLLOWERS",
          userId: {
            in: followingIds,
          },
        },
      ],
    };

    // Get posts
    const posts = await prisma.post.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },

            include: {
        media: true,
        user: {
          select: { id: true, username: true, profileImage: true, isVerified: true },
        },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId }, select: { id: true }, take: 1 },
        bookmarks: { where: { userId }, select: { id: true }, take: 1 },
      },
    });

    const formattedPosts = posts.map(({ _count, likes, bookmarks, ...post }) => ({
      ...post,
      likeCount: _count.likes,
      commentCount: _count.comments,
      isLiked: likes.length > 0,
      isSaved: bookmarks.length > 0,
    }));

    // Total number of posts
    const total = await prisma.post.count({
      where,
    });

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

      posts: formattedPosts,
    });
  } catch (error) {
    console.error("Feed error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch feed.",
    });
  }
};
