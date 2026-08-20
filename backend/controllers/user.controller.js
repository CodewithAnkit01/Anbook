import prisma from "../utils/prisma.js";
import upload from "../middleware/upload.middleware.js";

export const getMyProfile = async (req, res)=>{
    try {
        const user = await prisma.user.findUnique({
            where:{
                id:req.user.id,
            }, 
            select:{
                id: true,
                username: true,
                email: true,
                profileImage: true,
                coverImage: true,
                bio: true,
                website: true,
                location: true,
                role: true,
                isVerified: true,
                createdAt: true,
                
            }
        })
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        res.status(200).json({
            success: true,
            user,
        })

        
    } catch (error) {
      res.status(500).json({
      success: false,
      message: error.message,
    });
        
    }
}


export const getUserProfile = async (req, res)=>{
  try {
    const {username} = req.params;

    const user = await prisma.user.findUnique({
        where:{
            username,
        },
        select:{
            id: true,
            username: true,
            email: true,
            profileImage: true,
            coverImage: true,
            bio: true,
            website: true,
            location: true,
            role: true,
            isVerified: true,
            createdAt: true,
        }
    })
    if(!user){
        return res.status(404).json({
            success: true,
            message:"User not found",
        })
    }
    res.status(200).json({
        success: true,
        user,
    })
    
  } catch (error) {
     res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}



export const updateProfile = async (req, res)=>{
    try {

        const {username, bio, website, location}= req.body;

        if( username && username.length < 3){
            return res.status(400).json({
                success:false,
                message:"Username must be at least 3 characters",
            })
        }

        if(bio && bio.length > 200){
            return res.status(400).json({
        success: false,
        message: "Bio cannot exceed 200 characters.",
      });
        }

  if (username) {
  const existingUser = await prisma.user.findFirst({
    where: {
      username,
      NOT: {
        id: req.user.id,
      },
    },
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Username already exists.",
    });
  }
}
        const updateUser = await prisma.user.update({
            where:{
                id: req.user.id,
            },
            data:{
        username,
        bio,
        website,
        location,
            },
            select:{
        id: true,
        username: true,
        email: true,
        profileImage: true,
        coverImage: true,
        bio: true,
        website: true,
        location: true,

            }
        })

        res.status(200).json({
            success:true,
            message:"Profile Updated Successfully. "
        })
    } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
    }
}


export const searchUsers = async (req, res)=>{
    try {

        const {q} = req.query;

        if(!q){
            return res.status(400).json({
                success:false,
                message:"Search query is required",
            })
        }

        const users = await prisma.user.findMany({
            where:{
                username:{
                    contains:q,
                    mode:"insensitive",
                }
            },
            select:{
                id:true,
                username:true,
                profileImage:true,
                bio:true,
            },
            take:10,
        })
        res.status(200).json({
            success:true,
            users,
        })
    } catch (error) {
          res.status(500).json({
      success: false,
      message: error.message,
    });
    }
}


export const updateProfileImage = async (req, res)=>{
    try {
        if(!req.file){
            return res.status(400).json({
                success:false,
                message:"Please Upload an image."
            })
        }
        const result = await cloudinary.uploader.upload(req.file.path,{
            folder:"anfoot/profile",
        })
         fs.unlinkSync(req.file.path);

    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        profileImage: result.secure_url,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile image updated.",
      profileImage: user.profileImage,
    });
        
    } catch (error) {
        res.status(500).json({
      success: false,
      message: error.message,
    });
    }
}

export const updateCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image.",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "anfoot/cover",
    });

    fs.unlinkSync(req.file.path);

    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        coverImage: result.secure_url,
      },
    });

    res.status(200).json({
      success: true,
      message: "Cover image updated.",
      coverImage: user.coverImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

