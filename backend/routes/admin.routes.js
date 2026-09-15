import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

import {
  getDashboard,

  getReports,
  getReportById,
  updateReportStatus,

  getUsers,
  banUser,
  unbanUser,

  getPosts,
  deletePost,

  getComments,
  deleteComment,

  createAdmin,
  deleteAdmin
} from "../controllers/admin.controller.js";

import {
  validateBanUser,
  validateReportStatus,
  validateCreateAdmin
} from "../validators/admin.validator.js";

const router = express.Router();
router.use(verifyToken);

router.use(
  requireRole("ADMIN", "SUPERADMIN")
);

router.get("/dashboard", getDashboard)
router.get(
  "/reports",
  getReports
);

router.get(
  "/reports/:id",
  getReportById
);

router.patch(
  "/reports/:id",
  validateReportStatus,
  updateReportStatus
);

router.get(
  "/users",
  getUsers
);

router.patch(
  "/users/:id/ban",
  validateBanUser,
  banUser
);

router.patch(
  "/users/:id/unban",
  unbanUser
);

router.get(
  "/posts",
  getPosts
);

router.delete(
  "/posts/:id",
  deletePost
);

router.get(
  "/comments",
  getComments
);

router.delete(
  "/comments/:id",
  deleteComment
);


router.post(
  "/admins",
  requireRole("SUPERADMIN"),
  validateCreateAdmin,
  createAdmin
);

router.delete(
  "/admins/:id",
  requireRole("SUPERADMIN"),
  deleteAdmin
);
export default router;