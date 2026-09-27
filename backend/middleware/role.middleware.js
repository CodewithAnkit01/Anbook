import prisma from "../utils/prisma.js";

export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, role: true, isBanned: true },
      });

      if (!user) {
        return res.status(401).json({ success: false, message: "User not found." });
      }
      if (user.isBanned) {
        return res.status(403).json({ success: false, message: "Your account has been banned." });
      }
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin permission required.",
        });
      }

      req.admin = user;
      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  };
};