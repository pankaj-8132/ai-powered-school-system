import { createBrowserRouter } from "react-router";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import PrivateRoutes from "@/pages/routes/PrivateRoutes";
import Dashboard from "@/pages/Dashboard";
import AcademicYear from "@/pages/settings/academic-year";
import UserManagementPage from "@/pages/users";
import Classes from "@/pages/academics/Classes";
import { Subjects } from "@/pages/academics/Subjects";
import Timetable from "@/pages/academics/Timetable";
import Exams from "@/pages/lms/Exams";
import Exam from "@/pages/lms/Exam";
import Assignments from "@/pages/lms/Assignments";
import StudyMaterials from "@/pages/lms/StudyMaterials";
import NotFound from "@/pages/NotFound";
import ComingSoon from "@/pages/ComingSoon";
 
export const router = createBrowserRouter([
  // Public routesv
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
 
  // Protected routes
  {
    element: <PrivateRoutes />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/activities-log", element: <Dashboard /> },
      { path: "/settings/academic-years", element: <AcademicYear /> },
 
      // Users
      { path: "/users/students", element: <UserManagementPage role="student" title="Students" description="Manage student directory and class assignments." /> },
      { path: "/users/teachers", element: <UserManagementPage role="teacher" title="Teachers" description="Manage teaching staff." /> },
      { path: "/users/parents", element: <UserManagementPage role="parent" title="Parents" description="Manage Parents." /> },
      { path: "/users/admins", element: <UserManagementPage role="admin" title="Admins" description="Manage Admins." /> },
 
      // Academics
      { path: "/classes", element: <Classes /> },
      { path: "/subjects", element: <Subjects /> },
      { path: "/timetable", element: <Timetable /> },
      { path: "/attendance", element: <ComingSoon title="Attendance" /> },
 
      // ✅ LMS — all three fully built
      { path: "/lms/exams", element: <Exams /> },
      { path: "/lms/exams/:id", element: <Exam /> },
      { path: "/lms/assignments", element: <Assignments /> },
      { path: "/lms/materials", element: <StudyMaterials /> },
 
      // Settings
      { path: "/settings/general", element: <ComingSoon title="School Settings" /> },
      { path: "/settings/roles", element: <ComingSoon title="Roles & Permissions" /> },
 
      // Finance
      { path: "/finance/fees", element: <ComingSoon title="Fee Collection" /> },
      { path: "/finance/expenses", element: <ComingSoon title="Expenses" /> },
      { path: "/finance/salary", element: <ComingSoon title="Salary" /> },
    ],
  },
 
  // Catch-all
  { path: "*", element: <NotFound /> },
]);