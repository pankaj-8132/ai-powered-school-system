import express from "express";
import {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignment.ts";
import { protect, authorize } from "../middleware/auth.ts";
 
const assignmentRouter = express.Router();
 
assignmentRouter.get(
  "/",
  protect,
  authorize(["admin", "teacher", "student"]),
  getAssignments
);
 
assignmentRouter.post(
  "/create",
  protect,
  authorize(["admin", "teacher"]),
  createAssignment
);
 
assignmentRouter.patch(
  "/update/:id",
  protect,
  authorize(["admin", "teacher"]),
  updateAssignment
);
 
assignmentRouter.delete(
  "/delete/:id",
  protect,
  authorize(["admin", "teacher"]),
  deleteAssignment
);
 
export default assignmentRouter;