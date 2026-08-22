import prisma from "./prisma.js";

export const createNotification = async ({
    type,
    recipientId,
    senderId,
    postId = null,
    commentId = null,
})=>{
    try {
        if(recipientId === senderId){
            return null;
        }
        const notification = await prisma.notification.create({
            data:{
                  type,
        recipientId,
        senderId,
        postId,
        commentId,
            }
        })
         return notification;
    } catch (error) {
         console.error(
      "Create notification error:",
      error
    );

    return null;
    }
}