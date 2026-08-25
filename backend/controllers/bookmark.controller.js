import prisma from "../utils/prisma.js";

export const bookmarkPost = async (req, res)=>{
    try {

        const userId = req.user.id;
        const {postId} = req.params;

        const post = await prisma.post.findUnique({
            where:{
                id: postId,
            }, 
            select:{
                id: true,
            },
        })

            if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

        const existingBookmark = await prisma.bookmark.findUnique({
            where:{
                userId_postId:{
                    userId,
                    postId
                }
            }
            
        })
        if(!existingBookmark){
            return res.status(400).json({
        success: false,
        message: "Post already saved.",
      });
        }

        const bookmark = prisma.bookmark.create({
            data:{
                userId,
                postId
            }
        })
            return res.status(201).json({
      success: true,
      message: "Post saved successfully.",
      bookmark,
    });
        
    } catch (error) {
        console.error("Bookmark post error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save post.",
    });
    }
}

export const removeBookmark = async (req, res)=>{
    try {
        const userId = req.user.id;
        const {postId} = req.params;

        const bookmark =
      await prisma.bookmark.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Post is not saved.",
      });
    }

    await prisma.bookmark.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Post removed from saved posts.",
    });

        
    } catch (error) {
        console.error("Bookmark post error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove saved post.",
    });
    }
}

export const getBookmarks = async (req, res)=>{
    try {

        const userId = req.user.id;

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
    const bookmarks =
      await prisma.bookmark.findMany({
        where: {
          userId,
        },

        skip,
        take: limit,

        orderBy: {
          createdAt: "desc",
        },

        include: {
          post: {
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
          },
        },
      });

    const total = await prisma.bookmark.count({
        where: {
          userId,
        },
      });

    return res.status(200).json({
      success: true,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(
          total / limit
        ),
        hasNextPage:
          page < Math.ceil(total / limit),
      },

      bookmarks,
    });
        
    } catch (error) {
        console.error(
      "Get bookmarks error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get saved posts.",
    });
    }
}

export const checkBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const bookmark =
      await prisma.bookmark.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

    return res.status(200).json({
      success: true,
      isSaved: Boolean(bookmark),
    });
  } catch (error) {
    console.error(
      "Check bookmark error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to check saved status.",
    });
  }
};