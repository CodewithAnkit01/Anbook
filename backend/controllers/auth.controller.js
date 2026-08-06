import prisma from "../utils/prisma.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const generateToken = (user)=>{
    return jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
    },
process.env.JWT_ACCESS_SECRET,{
    expiresIn: "15m",
}
);
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


export const register = async (req, res)=>{

  try {

    let {username, email, password}= req.body;


      username = username?.trim();
    email = email?.trim().toLowerCase();


    if(!username|| !email || !password){
        return res.status(400).json({
            message:"All fields are required",
        })
    }

     // Name validation
    if (username.length < 3) {
      return res.status(400).json({
        message: "Username must be at least 3 characters",
      });
    }

    // Email validation
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Password validation
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain 8+ chars, uppercase, lowercase, number and special character",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if(existingUser){
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
const existingUsername = await prisma.user.findUnique({
  where: {
    username,
  },
});

if (existingUsername) {
  return res.status(400).json({
    success: false,
    message: "Username already exists.",
  });
}

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data:{
        username,
        email,
        password:hashedPassword,
      },
    });

    const token = generateToken(user);

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success:true,
      message:"User registered successfully",
      token,
      user:userWithoutPassword,
    })


}

    
   catch (error) {
     res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const login = async (req, res)=>{
  
  try {

       let { email, password } = req.body;

      
        email = email?.trim().toLowerCase();

    // Empty validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Email validation
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if(!user){
      return res.status(400).json({
        success:false,
        message:"Invalid Credentials",
      })
    }

    const match = await bcrypt.compare(password, user.password);

    if(!match){
      return res.status(400).json({
        success:false,
        message:"Invalid Credentials",
      })
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

     res.status(200).json({
      success: true,
      message:"User Login Successfully",
      token,
      user:userWithoutPassword,
    });


  } catch (error) {
      res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}




    