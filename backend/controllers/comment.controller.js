import prisma from "../utils/prisma.js";
import { createNotification } from "../utils/notification.js";
export const createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty.",
      });
    }

    if (content.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 500 characters.",
      });
    }

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

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId,
        postId,
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
      },
    });
            await createNotification({
  type: "COMMENT",
  recipientId: post.userId,
  senderId: userId,
  postId,
  commentId: comment.id,
});
    res.status(201).json({
      success: true,
      message: "Comment created successfully.",
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create comment.",
    });
  }
};


export const getPostComments = async (req, res)=>{
  try {
    const {postId} =req.params;

    const page = Math.max(Number(req.query.page) || 1,1);
    const limit = Math.min(Math.max(Number(req.query.limit)||20,1), 50);
    const skip = (page-1)* limit;

    const post = prisma.post.findUnique({
      where:{
        id:postId,
      },
      select:{
        id:true
      },
    })
      if(!post){
        return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
      }

      const comments = prisma.comment.findMany({
        where:{
          postId
        },
        skip,
        take: limit,

        orderBy:{
          createdAt: "desc",
        },
        include:{
          user:{
            select:{
              id:true,
              username:true,
              profileImage:true,
              isVerified:true,
            }
          }
        }
      })
      const total = await prisma.comment.count({
        where:{
          postId
        }
      })
      res.status(200).json({
      success: true,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage:
          page < Math.ceil(total / limit),
      },

      comments,
    });
  } catch (error) {
     console.error("Get comments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get comments.",
    });
  }
}

export const updateComment = async (req, res)=>{
  try {
    const userId = req.user.id;
    const {commentId} = req.params;
    const {content} = req.body;

    if(!content || !content.trim()){
       return res.status(400).json({
        success: false,
        message: "Comment cannot be empty.",
      });
    }
       if (content.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 500 characters.",
      });
    }

    const comment = await prisma.comment.findUnique({
      where:{
        commentId,
      }
    }); 
    if(!comment){
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }
    if(comment.userId !== userId){
       return res.status(403).json({
        success: false,
        message: "You can only edit your own comments.",
      });
    }

       const updatedComment =
      await prisma.comment.update({
        where: {
          id: commentId,
        },

        data: {
          content: content.trim(),
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
        },
      });

    res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      comment: updatedComment,
    });
  } catch (error) {
        console.error("Update comment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update comment.",
    });
  }
}


export const deleteComment = async (req, res)=>{
  try {
    const userId = req.user.id;
    const {commentId} = req.params;

    const comment = await prisma.comment.findUnique({
      where:{
        id:commentId,
      },
        include: {
        post: {
          select: {
            userId: true,
          },
        },
      },
    });

    const isCommentOwner =
      comment.userId === userId;

    const isPostOwner =
      comment.post.userId === userId;

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this comment.",
      });
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
    
  } catch (error) {
     console.error("Delete comment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete comment.",
    });
  }
}

export const getCommentCount = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const commentCount = await prisma.comment.count({
      where: {
        postId,
      },
    });

    res.status(200).json({
      success: true,
      commentCount,
    });
  } catch (error) {
    console.error("Comment count error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get comment count.",
    });
  }
};