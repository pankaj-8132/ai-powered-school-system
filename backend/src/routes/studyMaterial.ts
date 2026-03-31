import express from "express";
import {
  createMaterial,
  getMaterials,
  deleteMaterial,
} from "../controllers/studyMaterial.ts";
import { protect, authorize } from "../middleware/auth.ts";
 
const materialRouter = express.Router();
 
materialRouter.get(
  "/",
  protect,
  authorize(["admin", "teacher", "student"]),
  getMaterials
);
 
materialRouter.post(
  "/create",
  protect,
  authorize(["admin", "teacher"]),
  createMaterial
);
 
materialRouter.delete(
  "/delete/:id",
  protect,
  authorize(["admin", "teacher"]),
  deleteMaterial
);
 
export default materialRouter;