import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import type { schedule } from "@/types";
import GeneratorControls, {
  type GenSettings,
} from "@/components/timetable/GeneratorControls";
import TimetableGrid from "@/components/timetable/TimetableGrid";
 
const Timetable = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";
 
  const [scheduleData, setScheduleData] = useState<schedule[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
 
  const fetchTimetable = async (classId: string) => {
    if (!classId) return;
    try {
      setLoadingSchedule(true);
      const { data } = await api.get(`/timetables/${classId}`);
      setScheduleData(data.schedule || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setScheduleData([]);
        if (!isAdmin) {
          toast("No schedule found for this class", { icon: "📅" });
        }
      } else {
        toast.error("Failed to load timetable");
      }
    } finally {
      setLoadingSchedule(false);
    }
  };
 
  // ✅ Fixed: auto-fetch timetable for students using their assigned class
  useEffect(() => {
    if (isStudent && user?.studentClass) {
      const classId =
        typeof user.studentClass === "object"
          ? (user.studentClass as any)._id
          : user.studentClass;
      if (classId) {
        setSelectedClass(classId);
        fetchTimetable(classId);
      }
    }
  }, [isStudent, user]);
 
  // Fetch when class is selected manually (teacher/admin)
  useEffect(() => {
    if (!isStudent && selectedClass) {
      fetchTimetable(selectedClass);
    }
  }, [selectedClass]);
 
  const handleGenerate = async (
    classId: string,
    yearId: string,
    settings: GenSettings
  ) => {
    try {
      setIsGenerating(true);
      const { data } = await api.post("/timetables/generate", {
        classId,
        academicYearId: yearId,
        settings,
      });
      toast.success(data.message || "AI Generation Started");
 
      setTimeout(() => {
        fetchTimetable(classId);
        setIsGenerating(false);
        toast.success("Schedule refreshed!");
      }, 5000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Generation failed");
      setIsGenerating(false);
    }
  };
 
  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Timetable Management
        </h1>
        <p className="text-muted-foreground">
          {isStudent
            ? "View your weekly class schedule."
            : "View or manage weekly schedules."}
        </p>
      </div>
 
      {/* ✅ Fixed: students don't need controls — their class auto-loads */}
      {!isStudent && (
        <GeneratorControls
          onGenerate={handleGenerate}
          onClassChange={fetchTimetable}
          isGenerating={isGenerating}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
        />
      )}
 
      <TimetableGrid schedule={scheduleData} isLoading={loadingSchedule} />
    </div>
  );
};
 
export default Timetable;