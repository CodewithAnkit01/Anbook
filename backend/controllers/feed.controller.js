import prisma from "../utils/prisma.js";

export const getFeed = async (req, res)=>{
    try {
        const userId = req.user.id;

        const page = Math.max(Number(req.query.page) || 1,1)
        const limit= Math.min(
            Math.max(Number(req.query.limit) || 10,1),
            50
        );

        const skip = (page-1)* limit;

        const following = await prisma.follow.findMany({
            where:{
                followerId: userId,
            },
            select:{
                followingId: true,
            },
        });


        const followingIds = following.map(
            (follow)=> follow.followingId
        )

    const allowedUserIds = [
      userId,
      ...followingIds,
    ];

    const where = {
      userId: {
        in: allowedUserIds,
      },

      OR: [
        {
          visibility: "PUBLIC",
        },

        {
          visibility: "FOLLOWERS",
          userId: {
            in: allowedUserIds,
          },
        },

        {
          visibility: "PRIVATE",
          userId: userId,
        },
      ],
    };

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
          select: {
            id: true,
            username: true,
            profileImage: true,
            isVerified: true,
          },
        },
      },
    });

    const total = await prisma.post.count({
      where,
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

      posts,
    });

    } catch (error) {
        console.error("Feed error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch feed.",
    });
    }
}