import prisma from "../utils/prisma.js";
import cloudinary from "../utils/cloudinary.js";  
import fs from "fs";
import {
  connectHashtags,
} from "../utils/hashtag.js";

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

    await connectHashtags(
  post.id,
  caption
);

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
    const viewerId = req.user?.id; // set by optionalAuth, undefined if logged out

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    // Which visibilities may this viewer see?
    let allowed = ["PUBLIC"];
    if (viewerId === userId) {
      allowed = ["PUBLIC", "FOLLOWERS", "PRIVATE"];
    } else if (viewerId) {
      const isFollowing = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: viewerId, followingId: userId } },
      });
      if (isFollowing) allowed = ["PUBLIC", "FOLLOWERS"];
    }

    const where = { userId, visibility: { in: allowed } };

    const include = {
      media: true,
      user: { select: { id: true, username: true, profileImage: true, isVerified: true } },
      _count: { select: { likes: true, comments: true } },
    };
     if (viewerId) {
      include.likes = { where: { userId: viewerId }, select: { id: true }, take: 1 };
      include.bookmarks = { where: { userId: viewerId }, select: { id: true }, take: 1 };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include }),
      prisma.post.count({ where }),
    ]);

    const formattedPosts = posts.map(({ _count, likes, bookmarks, ...post }) => ({
      ...post,
      likeCount: _count.likes,
      commentCount: _count.comments,
      isLiked: Boolean(likes?.length),
      isSaved: Boolean(bookmarks?.length),
    }));

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
      posts: formattedPosts,
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({ success: false, message: "Failed to get posts." });
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
    await connectHashtags(
  post.id,
  caption
);

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
