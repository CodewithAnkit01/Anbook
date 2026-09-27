import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

// Requires a valid token. Used on routes that need a logged-in user.
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Check the database so bans, deleted accounts and role changes
    // take effect immediately instead of when the token expires.
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isBanned: true },
    });

  if (!user) {
  return res.status(401).json({ success: false, message: "Unauthorized" });
}

if (user.isBanned) {
  return res.status(403).json({
    success: false,
    message: "This account has been suspended.",
    isBanned: true,
    bannedReason: user.bannedReason,
    bannedAt: user.bannedAt,
  });
}
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

// Token is optional. If it's valid, req.user is set. If it's missing or
// invalid, the visitor is treated as logged out and the request continues.
// Used on public routes that show more to certain viewers (e.g. your own private posts).
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_ACCESS_SECRET);
    } catch {
      // invalid or expired token: continue as a logged-out visitor
    }
  }

  next();
};