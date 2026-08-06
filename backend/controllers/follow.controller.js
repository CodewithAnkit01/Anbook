import prisma from '../utils/prisma.js'

export const followUser = async (req, res)=>{
    try {
        const followerId = req.user.id;
        const followingId = req.params.id;

        if(followerId === followerId){
            return res.status(400).json({
                success:false,
                message:"You cannot follow yourself.",
            })
        }

        const user = await prisma.user.findUnique({
            where:{
                followingId,
            }
        });
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found."
            })
        };


        const alreadyFollowing = await prisma.follow.findUnique({
            where:{
                followerId_followingId:{
                    followerId,
                    followingId
                }
            }
        });

        if(!alreadyFollowing){
            return res.status(400).json({
        success: false,
        message: "Already following this user.",
      });
        }

        await prisma.follow.create({
            data:{
                followerId,
                followingId,
            }
        })

        res.status(201).json({
            success: true,
      message: "User followed successfully.",
        })
        
    } catch (error) {
        res.status(500).json({
      success: false,
      message: error.message,
    });
    }
}


export const unfollowUser = async (req, res)=>{
    try {
        const followerId = req.user.id;
        const followingId = req.params.id;

        const follow = await prisma.follow.findUnique({
            where:{
                followerId_followingId:{
                    followerId,
                    followingId,
                }
            }
        });

        if(!follow){
            return res.status(404).json({
                success:false,
                message:"Follow not found.",
            })
        }

        await prisma.follow.delete({
            where:{
                followerId_followingId:{
                    followerId,
                    followerId,
                }
            }
        })

        res.status(201).json({
            success: true,
            message:"User Unfollowed Successfully."
        })



    } catch (error) {
        res.status(500).json({
      success: false,
      message: error.message,
    });
    }
}


export const getFollowers = async (req, res)=>{
    try {
        const {id}= req.params;

        const followers = await prisma.follow.findMany({
            where:{
                followingId: id,
            }, 
            include:{
                follower:{
                    select:{
                        id: true,
            username: true,
            profileImage: true,
            bio: true,
                    }
                }
            }
        })

         res.status(200).json({
      success: true,
      total: followers.length,
      followers: followers.map((f) => f.follower),
    });
        
    } catch (error) {
        res.status(500).json({
      success: false,
      message: error.message,
    });
    }
}

export const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;

    const following = await prisma.follow.findMany({
      where: {
        followerId: id,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            bio: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      total: following.length,
      following: following.map((f) => f.following),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFollowCounts = async (req, res) => {
  try {
    const { id } = req.params;

    const followers = await prisma.follow.count({
      where: {
        followingId: id,
      },
    });

    const following = await prisma.follow.count({
      where: {
        followerId: id,
      },
    });

    res.status(200).json({
      success: true,
      followers,
      following,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};