import mongoose, { Schema, Document } from "mongoose";
 
export type MaterialType = "notes" | "video" | "link" | "document";
 
export interface IStudyMaterial extends Document {
  title: string;
  description?: string;
  subject: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  type: MaterialType;
  url: string;
  isActive: boolean;
}
 
const studyMaterialSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["notes", "video", "link", "document"],
      default: "notes",
    },
    url: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
 
export default mongoose.model<IStudyMaterial>(
  "StudyMaterial",
  studyMaterialSchema
);