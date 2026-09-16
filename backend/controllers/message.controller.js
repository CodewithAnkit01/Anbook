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

        const message = await prisma.message.create({
          
        })

    } catch (error) {
        
    }
}