import express from "express";
import {
  triggerExamGeneration,
  getExams,
  submitExam,
  getExamById,
  toggleExamStatus,
  getExamResult,
} from "../controllers/exam.ts";
import { protect, authorize } from "../middleware/auth.ts";
 
const examRouter = express.Router();
 
examRouter.post(
  "/generate",
  protect,
  authorize(["teacher", "admin"]),
  triggerExamGeneration
);
 
examRouter.get(
  "/",
  protect,
  authorize(["teacher", "student", "admin"]),
  getExams
);
 
// Student Routes
examRouter.post(
  "/:id/submit",
  protect,
  authorize(["student", "admin"]),
  submitExam
);
 
// ✅ Fixed: authorize must come BEFORE the controller, not after
examRouter.get(
  "/:id/result",
  protect,
  authorize(["student", "admin", "teacher"]),
  getExamResult
);
 
// ✅ Fixed: authorize must come BEFORE the controller, not after
examRouter.get(
  "/:id",
  protect,
  authorize(["teacher", "student", "admin"]),
  getExamById
);
 
// Teacher and admin routes
examRouter.patch(
  "/:id/status",
  protect,
  authorize(["teacher", "admin"]),
  toggleExamStatus
);
 
export default examRouter;