import { type Request, type Response } from "express";
import Assignment from "../models/assignment.ts";
import { logActivity } from "../utils/activitieslog.ts";
 
// @desc    Create Assignment
// @route   POST /api/assignments/create
// @access  Private/Teacher/Admin
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const { title, description, subject, class: classId, dueDate, totalMarks, attachmentUrl } = req.body;
    const assignment = await Assignment.create({
      title,
      description,
      subject,
      class: classId,
      teacher: (req as any).user._id,
      dueDate,
      totalMarks: totalMarks || 100,
      attachmentUrl,
    });
    await logActivity({
      userId: (req as any).user._id,
      action: `Created assignment: ${assignment.title}`,
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
 
// @desc    Get Assignments (role-based)
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
 
    let query: any = {};
 
    if (user.role === "student") {
      // Students see assignments for their class only
      query = { class: user.studentClass, isActive: true };
    } else if (user.role === "teacher") {
      // Teachers see assignments they created
      query = { teacher: user._id };
    }
    // Admins see all
 
    const [total, assignments] = await Promise.all([
      Assignment.countDocuments(query),
      Assignment.find(query)
        .populate("subject", "name code")
        .populate("class", "name")
        .populate("teacher", "name")
        .sort({ dueDate: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
 
    res.json({
      assignments,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
 
// @desc    Update Assignment
// @route   PATCH /api/assignments/update/:id
// @access  Private/Teacher/Admin
export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Assignment not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
 
// @desc    Delete Assignment
// @route   DELETE /api/assignments/delete/:id
// @access  Private/Teacher/Admin
export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const deleted = await Assignment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Assignment not found" });
    await logActivity({
      userId: (req as any).user._id,
      action: `Deleted assignment: ${deleted.title}`,
    });
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};