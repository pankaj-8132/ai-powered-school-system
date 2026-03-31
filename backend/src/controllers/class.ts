import { type Request, type Response } from "express";
import Class from "../models/class.ts";
import { logActivity } from "../utils/activitieslog.ts";
 
// @desc    Create a new Class
// @route   POST /api/classes
// @access  Private/Admin
export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, academicYear, classTeacher, capacity } = req.body;
 
    const existingClass = await Class.findOne({ name, academicYear });
    if (existingClass) {
      return res.status(400).json({
        message:
          "Class with this name already exists for the specified academic year.",
      });
    }
 
    const newClass = await Class.create({
      name,
      academicYear,
      classTeacher,
      capacity,
    });
    await logActivity({
      userId: (req as any).user.id,
      action: `Created new class: ${newClass.name}`,
    });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
 
// @desc    Get All Classes
// @route   GET /api/classes
// @access  Private
export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
 
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
 
    const [total, classes] = await Promise.all([
      Class.countDocuments(query),
      Class.find(query)
        .populate("academicYear", "name")
        .populate("classTeacher", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
 
    res.json({
      classes,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
 
// @desc    Update Class
// @route   PATCH /api/classes/update/:id
// @access  Private/Admin
export const updateClass = async (req: Request, res: Response) => {
  try {
    const classId = req.params.id;
 
    // ✅ Fixed: original code checked for ANY other class and always updated
    // Now correctly checks for duplicate name+academicYear conflict excluding current class
    const { name, academicYear } = req.body;
    if (name && academicYear) {
      const duplicate = await Class.findOne({
        name,
        academicYear,
        _id: { $ne: classId },
      });
      if (duplicate) {
        return res.status(400).json({
          message: "A class with this name already exists for this academic year.",
        });
      }
    }
 
    const updatedClass = await Class.findByIdAndUpdate(classId, req.body, {
      new: true,
      runValidators: true,
    });
 
    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }
 
    await logActivity({
      userId: (req as any).user.id,
      action: `Updated class: ${updatedClass.name}`,
    });
 
    return res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
 
// @desc    Delete Class
// @route   DELETE /api/classes/delete/:id
// @access  Private/Admin
export const deleteClass = async (req: Request, res: Response) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
 
    if (!deletedClass) {
      return res.status(404).json({ message: "Class not found" });
    }
 
    const userId = (req as any).user._id;
    await logActivity({
      userId,
      action: `Deleted class: ${deletedClass?.name}`,
    });
 
    res.json({ message: "Class removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};