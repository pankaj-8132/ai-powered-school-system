import express from "express";
import {
  createAcademicYear,
  getCurrentAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getAllAcademicYears,
} from "../controllers/academicYear.ts";
import { authorize, protect } from "../middleware/auth.ts";
 
const academicYearRouter = express.Router();
 
// ✅ Fixed: all roles need to fetch years (teacher/student for timetable)
academicYearRouter
  .route("/")
  .get(
    protect,
    authorize(["admin", "teacher", "student", "parent"]),
    getAllAcademicYears
  );
 
// Create/Update/Delete — admin only
academicYearRouter
  .route("/create")
  .post(protect, authorize(["admin"]), createAcademicYear);
 
// No protect — AuthProvider calls this on app load before login
academicYearRouter.route("/current").get(getCurrentAcademicYear);
 
academicYearRouter
  .route("/update/:id")
  .patch(protect, authorize(["admin"]), updateAcademicYear);
 
academicYearRouter
  .route("/delete/:id")
  .delete(protect, authorize(["admin"]), deleteAcademicYear);
 
export default academicYearRouter;