import express from "express";
import {
  createClass,
  updateClass,
  deleteClass,
  getAllClasses,
} from "../controllers/class.ts";
import { authorize, protect } from "../middleware/auth.ts";
 
const classRouter = express.Router();
 
// Create/Update/Delete — admin only
classRouter.post("/create", protect, authorize(["admin"]), createClass);
classRouter.patch("/update/:id", protect, authorize(["admin"]), updateClass);
classRouter.delete("/delete/:id", protect, authorize(["admin"]), deleteClass);
 
// ✅ Fixed: all roles need to fetch classes (teacher/student for timetable, parent for info)
classRouter.get(
  "/",
  protect,
  authorize(["admin", "teacher", "student", "parent"]),
  getAllClasses
);
 
export default classRouter;