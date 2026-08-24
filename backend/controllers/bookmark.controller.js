import prisma from "../utils/prisma.js";

export const bookmarkPost = async (req, res)=>{
    try {

        const userId = req.user.id;
        const {postId} = req.params;

        const post = await prisma.post.findUnique({
            where:{
                id: postId,
            }, 
            select:{
                id: true,
            },
        })

            if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

        const existingBookmark = await prisma.bookmark.findUnique({
            
        })
        
    } catch (error) {
        console.error("Bookmark post error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save post.",
    });
    }
}