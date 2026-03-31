import { type Request, type Response } from "express";
import StudyMaterial from "../models/studyMaterial.ts";
import { logActivity } from "../utils/activitieslog.ts";
 
// @desc    Create Study Material
// @route   POST /api/materials/create
// @access  Private/Teacher/Admin
export const createMaterial = async (req: Request, res: Response) => {
  try {
    const { title, description, subject, class: classId, type, url } = req.body;
    const material = await StudyMaterial.create({
      title,
      description,
      subject,
      class: classId,
      teacher: (req as any).user._id,
      type: type || "notes",
      url,
    });
    await logActivity({
      userId: (req as any).user._id,
      action: `Created study material: ${material.title}`,
    });
    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
 
// @desc    Get Study Materials (role-based)
// @route   GET /api/materials
// @access  Private
export const getMaterials = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
 
    let query: any = {};
 
    if (user.role === "student") {
      query = { class: user.studentClass, isActive: true };
    } else if (user.role === "teacher") {
      query = { teacher: user._id };
    }
 
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
 
    const [total, materials] = await Promise.all([
      StudyMaterial.countDocuments(query),
      StudyMaterial.find(query)
        .populate("subject", "name code")
        .populate("class", "name")
        .populate("teacher", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
 
    res.json({
      materials,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
 
// @desc    Delete Study Material
// @route   DELETE /api/materials/delete/:id
// @access  Private/Teacher/Admin
export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const deleted = await StudyMaterial.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Material not found" });
    await logActivity({
      userId: (req as any).user._id,
      action: `Deleted study material: ${deleted.title}`,
    });
    res.json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};