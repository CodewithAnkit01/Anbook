import express from "express";
import {
  createReport,
  getMyReports,
  getReportById,
} from "../controllers/report.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

import {
  validateReport,
} from "../validators/report.validator.js";


const router = express.Router();

router.post("/", verifyToken, validateReport, createReport)
router.get("/my", verifyToken, validateReport, getMyReports)
router.get("/:id", verifyToken, validateReport, getReportById)

export default router;