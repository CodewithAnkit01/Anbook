import prisma from "../utils/prisma.js";

export const getNotifications = async (req, res)=>{
    try {
        const userId = req.user.id;

         const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      50
    );

    const skip = (page - 1) * limit;

    const notification = await prisma.notification.findMany({
        where:{
            recipientId: userId,
        },
        skip,
        take:limit,

        orderBy:{
            createdAt: "desc"
        },
        include:{
            sender:{
                select:{
                    id: true,
              username: true,
              profileImage: true,
              isVerified: true,
                }
            },
              post: {
            select: {
              id: true,
              caption: true,
            },
          },
          comment: {
            select: {
              id: true,
              content: true,
            },
          },
        }
    })

    const total =
      await prisma.notification.count({
        where: {
          recipientId: userId,
        },
      });

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

      notifications,
    });
    } catch (error) {
          console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get notifications.",
    });
    }
}
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount =
      await prisma.notification.count({
        where: {
          recipientId: userId,
          isRead: false,
        },
      });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Unread count error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get unread count.",
    });
  }
};

export const markAsRead = async (req, res)=>{
try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
        where:{
            id,
            recipientId: userId,
        }
    })
    if(!notification){
         return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

        const updated = await prisma.notification.update({
            where:{
                id,
            },
            data:{
                isRead:true,

            }
        })


res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification: updated,
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
};


export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },

      data: {
        isRead: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error(
      "Mark all notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification =
      await prisma.notification.findFirst({
        where: {
          id,
          recipientId: userId,
        },
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    await prisma.notification.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete notification error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
};