import prisma from "../utils/prisma.js";

const publicUserSelect = {
  id: true,
  username: true,
  profileImage: true,
  bio: true,
  isVerified: true,
};

// Shared by posts search and hashtag posts, so both return the same shape as the feed
const postInclude = (viewerId) => {
  const include = {
    user: { select: { id: true, username: true, profileImage: true, isVerified: true } },
    media: true,
    _count: { select: { likes: true, comments: true } },
  };
  if (viewerId) {
    include.likes = { where: { userId: viewerId }, select: { id: true }, take: 1 };
    include.bookmarks = { where: { userId: viewerId }, select: { id: true }, take: 1 };
  }
  return include;
};

const formatPost = ({ _count, likes, bookmarks, ...post }) => ({
  ...post,
  likeCount: _count.likes,
  commentCount: _count.comments,
  isLiked: Boolean(likes?.length),
  isSaved: Boolean(bookmarks?.length),
});

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: "Search query is required." });
    }

    const where = {
      username: { contains: q.trim(), mode: "insensitive" },
      isBanned: false,
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { username: "asc" },
        select: publicUserSelect,
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
      users,
    });
  } catch (error) {
    console.error("Search users error:", error);
    return res.status(500).json({ success: false, message: "Failed to search users." });
  }
};

export const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: "Search query is required." });
    }

    const viewerId = req.user?.id;
    const where = {
      visibility: "PUBLIC",
      caption: { contains: q.trim(), mode: "insensitive" },
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: postInclude(viewerId),
      }),
      prisma.post.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
      posts: posts.map(formatPost),
    });
  } catch (error) {
    console.error("Search posts error:", error);
    return res.status(500).json({ success: false, message: "Failed to search posts." });
  }
};

export const searchHashtags = async (req, res) => {
  try {
    const { q } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: "Search query is required." });
    }

    const search = q.trim().replace(/^#/, "");
    const where = { name: { contains: search, mode: "insensitive" } };

    const [hashtags, total] = await Promise.all([
      prisma.hashtag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: { _count: { select: { posts: true } } },
      }),
      prisma.hashtag.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
      hashtags: hashtags.map((h) => ({ id: h.id, name: h.name, postCount: h._count.posts })),
    });
  } catch (error) {
    console.error("Search hashtags error:", error);
    return res.status(500).json({ success: false, message: "Failed to search hashtags." });
  }
};

// Unmodified in shape, kept for compatibility. The frontend uses the three
// endpoints above instead, since they support pagination and this one doesn't.
export const search = async (req, res) => {
  try {
    const { q, type } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: "Search query is required." });
    }
    if (!type) {
      return res.status(400).json({ success: false, message: "Search type is required." });
    }
    if (!["users", "posts", "hashtags"].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid search type." });
    }

    const search = q.trim();

    if (type === "users") {
      const users = await prisma.user.findMany({
        where: { username: { contains: search, mode: "insensitive" }, isBanned: false },
        take: 20,
        select: publicUserSelect,
      });
      return res.status(200).json({ success: true, type, results: users });
    }

    if (type === "posts") {
      const viewerId = req.user?.id;
      const posts = await prisma.post.findMany({
        where: { visibility: "PUBLIC", caption: { contains: search, mode: "insensitive" } },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: postInclude(viewerId),
      });
      return res.status(200).json({ success: true, type, results: posts.map(formatPost) });
    }

    const hashtags = await prisma.hashtag.findMany({
      where: { name: { contains: search.replace(/^#/, ""), mode: "insensitive" } },
      take: 20,
      include: { _count: { select: { posts: true } } },
    });
    return res.status(200).json({
      success: true,
      type,
      results: hashtags.map((h) => ({ id: h.id, name: h.name, postCount: h._count.posts })),
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ success: false, message: "Search failed." });
  }
};