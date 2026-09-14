import prisma from "../utils/prisma.js";

export const createReport = async (req, res)=>{
    try {
        const reporterId = req.user.id;

        const {targetType, targetId, reason, description} = req.body;

        if(targetType = "USER"){
            if(targetId === reporterId){
                 return res.status(400).json({
          success: false,
          message:
            "You cannot report yourself.",
        });
            }
        }

        let targetExists = false;

        if(targetType === "USER"){
            const user =
        await prisma.user.findUnique({
          where: {
            id: targetId,
          },

          select: {
            id: true,
          },
        });

      targetExists = Boolean(user);
        }


    if (targetType === "POST") {
      const post =
        await prisma.post.findUnique({
          where: {
            id: targetId,
          },

          select: {
            id: true,
          },
        });

      targetExists = Boolean(post);
    }

    if (targetType === "COMMENT") {
      const comment =
        await prisma.comment.findUnique({
          where: {
            id: targetId,
          },

          select: {
            id: true,
          },
        });

      targetExists = Boolean(comment);
    }
         if (!targetExists) {
      return res.status(404).json({
        success: false,
        message: "Reported target not found.",
      });
    }


    const existingReport = await prisma.report.findFirst({
        where:{
            reporterId,
          targetType,
          targetId,
        },
        status:{
            in:[
                "PENDING",
              "REVIEWING",
            ]
        }
    })
    if(!existingReport){
        return res.status(409).json({
        success: false,
        message:
          "You already reported this item.",
      });
    }

    const report = await prisma.report.create({
        data:{
                reporterId,
                targetType,
                targetId,
                reason,
                description: description?.trim() || null,       
            }
    })

    return res.status(201).json({
      success: true,
      message:
        "Report submitted successfully.",
      report,
    });
    } catch (error) {
        console.error(
      "Create report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to submit report.",
    });
    }
}

export const getMyReports = async (req, res)=>{
    try {
          const reporterId = req.user.id;

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
        
    const reports = await prisma.report.findMany({
        where:{
            reporterId,
        },
        skip,
        take:limit,

        orderBy:{
            createdAt:"desc",
        },
        include:{
            reviewer:{
                select:{
                    id:true,
                    username: true,
                },
            },
        },
    });

    const total = await prisma.report.count({
        where:{
            reporterId,
        }
    })

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

      reports,
    });

    } catch (error) {
            console.error(
      "Get my reports error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get your reports.",
    });
    }
}

export const getReportById = async (
  req,
  res
) => {
  try {
    const reporterId = req.user.id;
    const { id } = req.params;

    const report =
      await prisma.report.findFirst({
        where: {
          id,
          reporterId,
        },

        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error(
      "Get report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get report.",
    });
  }
};