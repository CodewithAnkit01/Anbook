import prisma from "../utils/prisma.js";

export const createConversation = async (req, res)=>{
    try {
        const userId  = req.user.id;
        const {receiverId} = req.body;

        if(!receiverId){
                  return res.status(400).json({
        success: false,
        message: "Receiver ID is required.",
      });
        }

        if(receiverId === userId){
                  return res.status(400).json({
        success: false,
        message: "You cannot create a conversation with yourself.",
      });
        }

        const reciver = await prisma.user.findUnique({
          where:{
            id: receiverId,
          },
          select:{
                    id: true,
        username: true,
        profileImage: true,
        isVerified: true,
        isBanned: true,
          }
        })

            if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (receiver.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Cannot message a banned user.",
      });
    }

    const [user1Id, user2Id] = userId < receiverId ?[userId, receiverId]:[receiverId, userId];

    const conversation = await prisma.conversation.upsert({
      where:{
        user1Id_user2Id:{
          user1Id,
          user2Id
        },
      },
      update:{},

      create:{
        user1Id,
        user2Id,
      },
      include:{
                  user1: {
            select: {
              id: true,
              username: true,
              profileImage: true,
              isVerified: true,
            },
          },

          user2: {
            select: {
              id: true,
              username: true,
              profileImage: true,
              isVerified: true,
            },
          },
      }
    })

    res.status(200).json({
      success:true,
      conversation,
    })
    } catch (error) {
          console.error(
      "Create conversation error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create conversation.",
    });  
    }
}

export const getConversations = async (req, res)=>{
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

    const where ={
      OR:[{
        user1Id: userId,
      },{
        user2Id:userId,
      }]
    }
    const conversation = await prisma.conversation.findMany({
      where,
      skip,
      take:limit,
      orderBy:{
        updatedAt: "desc",
      },
             include: {
          user1: {
            select: {
              id: true,
              username: true,
              profileImage: true,
              isVerified: true,
            },
          },

          user2: {
            select: {
              id: true,
              username: true,
              profileImage: true,
              isVerified: true,
            },
          },

          messages: {
            orderBy: {
              createdAt: "desc",
            },

            take: 1,

            select: {
              id: true,
              content: true,
              senderId: true,
              isRead: true,
              createdAt: true,
            },
          },
        },
      });

          const total =
      await prisma.conversation.count({
        where,
      });

          const formattedConversations =
      conversations.map((conversation) => {
        const otherUser =
          conversation.user1Id === userId
            ? conversation.user2
            : conversation.user1;

        return {
          id: conversation.id,

          user: otherUser,

          lastMessage:
            conversation.messages[0] || null,

          updatedAt: conversation.updatedAt,
        };
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

      conversations: formattedConversations,
    });
  } catch (error) {
    console.error(
      "Get conversations error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get conversations.",
    });
  }
};


export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const { conversationId } = req.params;

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 30, 1),
      100
    );

    const skip = (page - 1) * limit;

    const conversation =
      await prisma.conversation.findFirst({
        where: {
          id: conversationId,

          OR: [
            {
              user1Id: userId,
            },
            {
              user2Id: userId,
            },
          ],
        },
      });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const messages =
      await prisma.message.findMany({
        where: {
          conversationId,
        },

        skip,
        take: limit,

        orderBy: {
          createdAt: "desc",
        },

        include: {
          sender: {
            select: {
              id: true,
              username: true,
              profileImage: true,
              isVerified: true,
            },
          },
        },
      });

    const total =
      await prisma.message.count({
        where: {
          conversationId,
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

      messages,
    });
  } catch (error) {
    console.error(
      "Get messages error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get messages.",
    });
  }
};

