import prisma from "../utils/prisma.js";

export const getHashtag = async (req, res) => {
  try {
    const { name } = req.params;

    const hashtagName = name
      .replace(/^#/, "")
      .toLowerCase();

    const hashtag =
      await prisma.hashtag.findUnique({
        where: {
          name: hashtagName,
        },

        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

    if (!hashtag) {
      return res.status(404).json({
        success: false,
        message: "Hashtag not found.",
      });
    }

    return res.status(200).json({
      success: true,

      hashtag: {
        id: hashtag.id,
        name: hashtag.name,
        postCount: hashtag._count.posts,
      },
    });
  } catch (error) {
    console.error(
      "Get hashtag error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get hashtag.",
    });
  }
};



export const getHashtagPOsts = async (req, res) => {
  try {
    const { name } = req.params;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const hashtagName = name.replace(/^#/, "").toLowerCase();
    const viewerId = req.user?.id;

    // FIX: was `name: hashtag` (referencing itself before it existed)
    const hashtag = await prisma.hashtag.findUnique({ where: { name: hashtagName } });

    if (!hashtag) {
      return res.status(404).json({ success: false, message: "Hashtag not found." });
    }

    const where = { hashtagId: hashtag.id, post: { visibility: "PUBLIC" } };

    const [postHashtags, total] = await Promise.all([
      prisma.postHashtag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { post: { createdAt: "desc" } },
        include: { post: { include: postInclude(viewerId) } },
      }),
      prisma.postHashtag.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      hashtag: hashtag.name,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
      posts: postHashtags.map((item) => formatPost(item.post)),
    });
  } catch (error) {
    console.error("Get hashtag posts error:", error);
    return res.status(500).json({ success: false, message: "Failed to get hashtag posts." });
  }
};


export const getTrendingHashtags = async (req, res)=>{
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const hashtags =
      await prisma.hashtag.findMany({
        take: limit,

        orderBy: {
          posts: {
            _count: "desc",
          },
        },

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

      hashtags: hashtags.map((hashtag) => ({
        id: hashtag.id,
        name: hashtag.name,
        postCount: hashtag._count.posts,
      })),
    });
  } catch (error) {
    console.error(
      "Trending hashtags error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get trending hashtags.",
    });
  }
}