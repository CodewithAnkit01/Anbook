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