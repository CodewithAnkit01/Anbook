import prisma from "../utils/prisma.js";

export const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalComments,
      pendingReports,
      bannedUsers
    ] = await Promise.all([
      prisma.user.count(),

      prisma.post.count(),

      prisma.comment.count(),

      prisma.report.count({
        where: {
          status: "PENDING"
        }
      }),

      prisma.user.count({
        where: {
          isBanned: true
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        totalComments,
        pendingReports,
        bannedUsers
      }
    });
  } catch (error) {
    console.error("Get dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard."
    });
  }
};


export const getReports = async(req, res)=>{
    try {
           const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;
    const { status, targetType } = req.query;

    const where = {};

    if(status){
        where.status = status;
    }
    if (targetType) {
      where.targetType = targetType;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,

        orderBy: {
          createdAt: "desc"
        },

        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              profileImage: true
            }
          },

          reviewer: {
            select: {
              id: true,
              username: true
            }
          }
        }
      }),

      prisma.report.count({
        where
      })
    ]);

    return res.status(200).json({
      success: true,

      data: {
        reports,

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Get reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports."
    });
  }
};


export const getReportById = async (req, res)=>{
    try {
        const {id} = req.params;
        const report = await prisma.report.findUnique({
            where:{
                id
            },
            include:{
                reporter:{
                    select:{
                                  id: true,
            username: true,
            email: true,
            profileImage: true  
                    }
                }
            },
            reviewer:{
                          select: {
            id: true,
            username: true
          }

            }
        })

        if(!report){
                  return res.status(404).json({
        success: false,
        message: "Report not found."
      });
        }

            return res.status(200).json({
      success: true,
      data: report
    }); 
    } catch (error) {
            console.error("Get report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch report."
    });
    }
}

export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await prisma.report.findUnique({
      where: {
        id
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found."
      });
    }

    const updatedReport = await prisma.report.update({
      where: {
        id
      },

      data: {
        status,

        reviewedBy: req.admin.id,

        reviewedAt: new Date()
      },

      include: {
        reporter: {
          select: {
            id: true,
            username: true
          }
        },

        reviewer: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: `Report marked as ${status.toLowerCase()}.`,
      data: updatedReport
    });
  } catch (error) {
    console.error("Update report status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update report."
    });
  }
};


export const getUsers = async (req, res)=>{
  try {
        const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    const {search, role, isBanned}= req.query;
    const where = {};

    if(search){
      where.OR =[
        {
          username:{
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email:{
            contains: search,
            mode:"insensitive"
          }
        },
      ]
    }

    if(role){
      where.role = role;
    }

        if (isBanned !== undefined) {
      where.isBanned = isBanned === "true";
    }
    
const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,

        select: {
          id: true,
          username: true,
          email: true,
          profileImage: true,
          coverImage: true,
          isVerified: true,
          role: true,
          isBanned: true,
          bannedAt: true,
          bannedReason: true,
          createdAt: true
        },

        orderBy: {
          createdAt: "desc"
        }
      }),

      prisma.user.count({
        where
      })
    ]);

    return res.status(200).json({
      success: true,

      data: {
        users,

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users."
    });
  }
};


export const banUser = async (req, res)=>{
  try {
    const {id} = req.params;
    const {reason} = req.body;

        const targetUser = await prisma.user.findUnique({
      where: {
        id
      },

      select: {
        id: true,
        username: true,
        role: true,
        isBanned: true
      }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // Cannot ban yourself
    if (targetUser.id === req.admin.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot ban yourself."
      });
    }

    // Nobody can ban SUPERADMIN
    if (targetUser.role === "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "SUPERADMIN cannot be banned."
      });
    }

    // ADMIN cannot ban another ADMIN
    if (
      targetUser.role === "ADMIN" &&
      req.admin.role !== "SUPERADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only SUPERADMIN can ban an ADMIN."
      });
    }

    if (targetUser.isBanned) {
      return res.status(400).json({
        success: false,
        message: "User is already banned."
      });
    }

    const user = await prisma.user.update({
      where:{
        id,
      },
      data:{
        isBanned: true,
        bannedAt: new Date(),
        bannedReason: reason,
      },
      select:{
                id: true,
        username: true,
        role: true,
        isBanned: true,
        bannedAt: true,
        bannedReason: true
      }
    })

    return res.status(200).json({
      success: true,
      message: "User banned successfully.",
      data: user
    });

  } catch (error) {
    console.error("Ban user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to ban user."
    });
  }
};


export const unbanUser = async (req, res)=>{
  try {
    const {id} = req.params;

    const targetUser = await prisma.user.findUnique({
            where: {
        id
      },

      select: {
        id: true,
        username: true,
        role: true,
        isBanned: true
      }
    })

if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (targetUser.role === "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "SUPERADMIN cannot be modified."
      });
    }

    if (
      targetUser.role === "ADMIN" &&
      req.admin.role !== "SUPERADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only SUPERADMIN can modify an ADMIN."
      });
    }

    if (!targetUser.isBanned) {
      return res.status(400).json({
        success: false,
        message: "User is not banned."
      });
    }

    const user = await prisma.user.update({
      where: {
        id
      },

      data: {
        isBanned: false,
        bannedAt: null,
        bannedReason: null
      },

      select: {
        id: true,
        username: true,
        role: true,
        isBanned: true,
        bannedAt: true,
        bannedReason: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "User unbanned successfully.",
      data: user
    });
  } catch (error) {
    console.error("Unban user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unban user."
    });
  }
};


export const getPosts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    const search = req.query.search;

    const where = {};

    if (search) {
      where.content = {
        contains: search,
        mode: "insensitive"
      };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,

        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,

          user: {
            select: {
              id: true,
              username: true,
              profileImage: true
            }
          }
        },

        orderBy: {
          createdAt: "desc"
        }
      }),

      prisma.post.count({
        where
      })
    ]);

    return res.status(200).json({
      success: true,

      data: {
        posts,

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Get admin posts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts."
    });
  }
};


// =====================================================
// DELETE POST
// =====================================================

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        id
      },

      select: {
        id: true
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found."
      });
    }

    await prisma.post.delete({
      where: {
        id
      }
    });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully."
    });
  } catch (error) {
    console.error("Delete post error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete post."
    });
  }
};


// =====================================================
// COMMENTS
// =====================================================

export const getComments = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    const search = req.query.search;

    const where = {};

    if (search) {
      where.content = {
        contains: search,
        mode: "insensitive"
      };
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,

        select: {
          id: true,
          content: true,
          parentId: true,
          createdAt: true,
          updatedAt: true,

          user: {
            select: {
              id: true,
              username: true,
              profileImage: true
            }
          },

          post: {
            select: {
              id: true,
              content: true
            }
          }
        },

        orderBy: {
          createdAt: "desc"
        }
      }),

      prisma.comment.count({
        where
      })
    ]);

    return res.status(200).json({
      success: true,

      data: {
        comments,

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Get admin comments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments."
    });
  }
};


// =====================================================
// DELETE COMMENT
// =====================================================

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: {
        id
      },

      select: {
        id: true
      }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found."
      });
    }

    await prisma.comment.delete({
      where: {
        id
      }
    });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully."
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete comment."
    });
  }
};


// =====================================================
// SUPERADMIN — CREATE ADMIN
// =====================================================

export const createAdmin = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },

      select: {
        id: true,
        username: true,
        role: true,
        isBanned: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.role === "SUPERADMIN") {
      return res.status(400).json({
        success: false,
        message: "User is already SUPERADMIN."
      });
    }

    if (user.role === "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "User is already ADMIN."
      });
    }

    if (user.isBanned) {
      return res.status(400).json({
        success: false,
        message: "Banned user cannot become ADMIN."
      });
    }

    const admin = await prisma.user.update({
      where: {
        id: userId
      },

      data: {
        role: "ADMIN"
      },

      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isVerified: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "User promoted to ADMIN successfully.",
      data: admin
    });
  } catch (error) {
    console.error("Create admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to promote user."
    });
  }
};


// =====================================================
// SUPERADMIN — REMOVE ADMIN
// =====================================================

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id
      },

      select: {
        id: true,
        username: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.role === "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "SUPERADMIN role cannot be removed."
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "User is not an ADMIN."
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id
      },

      data: {
        role: "USER"
      },

      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "ADMIN role removed successfully.",
      data: updatedUser
    });
  } catch (error) {
    console.error("Delete admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove admin role."
    });
  }
};

