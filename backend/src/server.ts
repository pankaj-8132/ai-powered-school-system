import express, { type Application, type Request, type Response, type NextFunction } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
 
import { connectDB } from "./config/db.ts";
 
// Routes
import userRoutes from "./routes/user.ts";
import LogsRouter from "./routes/activitieslog.ts";
import academicYearRouter from "./routes/academicYear.ts";
import classRouter from "./routes/class.ts";
import subjectRouter from "./routes/subject.ts";
import timeRouter from "./routes/timetable.ts";
import examRouter from "./routes/exam.ts";
import dashboardRouter from "./routes/dashboard.ts";
import assignmentRouter from "./routes/assignment.ts";
import materialRouter from "./routes/studyMaterial.ts";
 
// Inngest
import { serve } from "inngest/express";
import { inngest } from "./inngest/index.ts";
import { generateTimeTable, generateExam, handleExamSubmission } from "./inngest/functions.ts";
import path from "path";
const app: Application = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
 
if (process.env.STAGE === "development") {
  app.use(morgan("dev"));
}
 
// CORS
app.use(
  cors({
    origin: "https://ai-powered-school-system-1-4.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
 
// Health check
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});
 
// Routes
app.use("/api/users", userRoutes);
app.use("/api/activities", LogsRouter);
app.use("/api/academic-years", academicYearRouter);
app.use("/api/classes", classRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/timetables", timeRouter);
app.use("/api/exams", examRouter);
app.use("/api/dashboard", dashboardRouter);
// ✅ New routes
app.use("/api/assignments", assignmentRouter);
app.use("/api/materials", materialRouter);
 
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [generateTimeTable, generateExam, handleExamSubmission],
  })
);
 
// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});
 
// Connect DB and start server

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", (error as Error).message);
    process.exit(1);
  }
})();
