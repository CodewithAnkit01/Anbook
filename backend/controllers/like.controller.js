import prisma from "../utils/prisma.js";
import { createNotification } from "../utils/notification.js";

export const likePost = async (req, res)=>{
    try {
        const userId = req.user.id;
        const {postId} = req.params;

        const post = await prisma.post.findUnique({
            where:{
                postId,
            }
        })
         if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }
        const existingLike = await prisma.like.findUnique({
            where:{
                userId_postId: {
          userId,
          postId,
        },
            }
        })

            if (existingLike) {
      return res.status(400).json({
        success: false,
        message: "You already liked this post.",
      });
    }
       await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    await createNotification({
  type: "LIKE",
  recipientId: post.userId,
  senderId: userId,
  postId,
});

    const likeCount = await prisma.like.count({
      where: {
        postId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Post liked successfully.",
      likeCount,
      isLiked: true,
    });
    } catch (error) {
        
        console.error("Like post error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to like post.",
    });
    }
}

export const unlikePost = async (req, res)=>{
    try {
        const userId = req.user.id;
        const {postId} = req.params;


        const existingLike = await prisma.like.findUnique({
            where:{
                userId_postId:{
                    userId,
                    postId
                }
            }
        })
             if (!existingLike) {
      return res.status(404).json({
        success: false,
        message: "You have not liked this post.",
      });
    }

        await prisma.like.delete({
            where:{
                userId_postId:{
                    userId,
                    postId
                }
            }
        })

        const likeCount = await prisma.like.count({
            where:{
                postId
            }
        })
                    return res.status(200).json({
      success: true,
      message: "Post unliked successfully.",
      likeCount,
      isLiked: false,
    });
    } catch (error) {
         console.error("Unlike post error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unlike post.",
    });
    }
}

export const getLikeCount = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const likeCount = await prisma.like.count({
      where: {
        postId,
      },
    });

    return res.status(200).json({
      success: true,
      likeCount,
    });
  } catch (error) {
    console.error("Get like count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get like count.",
    });
  }
};


export const checkLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return res.status(200).json({
      success: true,
      isLiked: Boolean(like),
    });
  } catch (error) {
    console.error("Check like error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check like.",
    });
  }
};


export const getPostLikes = async (req, res) =>{
  try {
    const {postId} = req.params;

    const likes = await prisma.like.findMany({
      where:{
        postId
      },
      orderBy:{
        createdAt: "desc",

      },
      include:{
        user:{
          select:{
            id: true,
            username: true,
            profileImage: true,
            isVerified: true,
          }
        }
      }
    })
    return res.status(200).json({
      success:true,
      total: likes.length,
      users: likes.map((like) => like.user),
    })

  } catch (error) {
    console.error("Get post likes error:", error);

    return res.status(500).json({
  success: false,
  message: "Failed to get post likes.",
});
  }
}