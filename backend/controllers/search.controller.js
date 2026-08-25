import prisma from "../utils/prisma.js";

export const searchUsers = async (req, res)=>{
    try {
        const {q} = req.query;

        const page = Math.max(Number(req.query.page) || 1, 1);

         const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      50
    );
    const skip = (page - 1) * limit;

     if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }
    const search = q.trim();

    const users = await prisma.user.findMany({
        where:{
            username:{
                contains: search,
                mode:"insensitive"
            }
        },
            skip,
      take: limit,

      orderBy: {
        username: "asc",
      },

      select: {
        id: true,
        username: true,
        profileImage: true,
        bio: true,
        isVerified: true,
      },
    });

    const total = await prisma.user.count({
      where: {
        username: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    return res.status(200).json({
      success: true,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage:
          page < Math.ceil(total / limit),
      },

      users,
    });
        
    } catch (error) {
        console.error("Search users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search users.",
    });
    }
}


export const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      50
    );

    const skip = (page - 1) * limit;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    const search = q.trim();

    const where = {
      visibility: "PUBLIC",

      caption: {
        contains: search,
        mode: "insensitive",
      },
    };

    const posts = await prisma.post.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            isVerified: true,
          },
        },

        media: true,
      },
    });

    const total = await prisma.post.count({
      where,
    });

    return res.status(200).json({
      success: true,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage:
          page < Math.ceil(total / limit),
      },

      posts,
    });
  } catch (error) {
    console.error("Search posts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search posts.",
    });
  }
};




export const searchHashtags = async (req, res) => {
  try {
    const { q } = req.query;

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      50
    );

    const skip = (page - 1) * limit;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    const search = q
      .trim()
      .replace(/^#/, "");

    const hashtags =
      await prisma.hashtag.findMany({
        where: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },

        skip,
        take: limit,

        orderBy: {
          name: "asc",
        },

        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

    const total =
      await prisma.hashtag.count({
        where: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      });

    return res.status(200).json({
      success: true,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage:
          page < Math.ceil(total / limit),
      },

      hashtags: hashtags.map((hashtag) => ({
        id: hashtag.id,
        name: hashtag.name,
        postCount: hashtag._count.posts,
      })),
    });
  } catch (error) {
    console.error(
      "Search hashtags error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to search hashtags.",
    });
  }
};


export const search = async (req, res) => {
  try {
    const { q, type } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message:
          "Search type is required.",
      });
    }

    if (
      !["users", "posts", "hashtags"].includes(
        type
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid search type.",
      });
    }

    const search = q.trim();

    if (type === "users") {
      const users =
        await prisma.user.findMany({
          where: {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },

          take: 20,

          select: {
            id: true,
            username: true,
            profileImage: true,
            bio: true,
            isVerified: true,
          },
        });

      return res.status(200).json({
        success: true,
        type,
        results: users,
      });
    }

    if (type === "posts") {
      const posts =
        await prisma.post.findMany({
          where: {
            visibility: "PUBLIC",

            caption: {
              contains: search,
              mode: "insensitive",
            },
          },

          take: 20,

          orderBy: {
            createdAt: "desc",
          },

          include: {
            user: {
              select: {
                id: true,
                username: true,
                profileImage: true,
                isVerified: true,
              },
            },

            media: true,
          },
        });

      return res.status(200).json({
        success: true,
        type,
        results: posts,
      });
    }

    const hashtags =
      await prisma.hashtag.findMany({
        where: {
          name: {
            contains: search.replace(/^#/, ""),
            mode: "insensitive",
          },
        },

        take: 20,

        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

    return res.status(200).json({
      success: true,
      type,

      results: hashtags.map((hashtag) => ({
        id: hashtag.id,
        name: hashtag.name,
        postCount: hashtag._count.posts,
      })),
    });
  } catch (error) {
    console.error("Search error:", error);

    return res.status(500).json({
      success: false,
      message: "Search failed.",
    });
  }
};