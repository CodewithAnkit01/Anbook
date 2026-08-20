import prisma from "../utils/prisma.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const createPost = async (req, res) => {
  try {
    const { caption, visibility } = req.body;

    // Validate post content
    if (!caption && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Post must contain text or media.",
      });
    }

    // Allowed visibility
    const allowedVisibility = [
      "PUBLIC",
      "FOLLOWERS",
      "PRIVATE",
    ];

    const postVisibility = visibility || "PUBLIC";

    if (!allowedVisibility.includes(postVisibility)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post visibility.",
      });
    }

    // Store uploaded media
    const uploadedMedia = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        let resourceType = "image";

        if (file.mimetype.startsWith("video/")) {
          resourceType = "video";
        }

        const result = await cloudinary.uploader.upload(file.path, {
          folder: "anfoot/posts",
          resource_type: resourceType,
        });

        uploadedMedia.push({
          url: result.secure_url,
          type: resourceType === "video" ? "VIDEO" : "IMAGE",
        });

        // Delete local file
        fs.unlinkSync(file.path);
      }
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        caption,
        visibility: postVisibility,
        userId: req.user.id,

        media: {
          create: uploadedMedia,
        },
      },

      include: {
        media: true,

        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully.",
      post,
    });
  } catch (error) {
    console.error("Create Post Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getPostById = async (req, res)=>{
  try {
     const {id}= req.params;

const post = await prisma.post.findUnique({
  where: {
    id: req.params.id,
  },
  include: {
    user: {
      select: {
        id: true,
        username: true,
        profileImage: true,
      },
    },
    media: true,
  },
});

  if(!post){
    return res.status(404).json({
      success:true,
      message:"POst not found."
  }
)}
if(post.visibility ==="PRIVATE"){
  if(!req.user || req.user.id  !== post.userId){
    return res.status(403).json({
      success:false,
      message:"This post is private."
    })
  }

}
if(post.visibility === "FOLLOWERS" && (req.user || req.user.id !== post.userId)){
  if(!req.user){
    return res.status(403).json({
          success: false,
          message: "You must be logged in.",
        });
  }
        const isFollowing = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: req.user.id,
            followingId: post.userId,
          },
        },
      });

      if (!isFollowing) {
        return res.status(403).json({
          success: false,
          message: "Only followers can view this post.",
        });
      }
    }

    res.status(200).json({
      success: true,
      post,
    });

  }
  catch (error) {
     res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: {
        userId,
      },
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
          },
        },
      },
    });

    const total = await prisma.post.count({
      where: {
        userId,
      },
    });

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePost = async (req, res)=>{
  try {
    const {id} = req.params;
    const {caption, visibility}= req.body;

      const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own posts.",
      });
    }

    const allowedVisibility = [
      "PUBLIC",
      "FOLLOWERS",
      "PRIVATE",
    ];
       if (
      visibility &&
      !allowedVisibility.includes(visibility)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid visibility.",
      });
    }

    const updatedPost = await prisma.post.update({
      where: {
        id,
      },

      data: {
        ...(caption !== undefined && { caption }),

        ...(visibility !== undefined && {
          visibility,
        }),
      },

      include: {
        media: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Post updated successfully.",
      post: updatedPost,
    });
  } catch (error) {
     res.status(500).json({
      success: false,
      message: error.message,
    });
  }

}

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts.",
      });
    }

    await prisma.post.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};