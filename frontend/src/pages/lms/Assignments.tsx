import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { toast } from "sonner";
import { Plus, FileText, Clock, BookOpen, Loader2, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardHeader, CardTitle, CardContent, CardFooter,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import CustomAlert from "@/components/global/CustomAlert";
 
interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: { _id: string; name: string; code: string };
  class: { _id: string; name: string };
  teacher: { _id: string; name: string };
  dueDate: string;
  totalMarks: number;
  isActive: boolean;
}
 
interface Subject { _id: string; name: string; code: string; }
interface Class { _id: string; name: string; }
 
const Assignments = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher" || user?.role === "admin";
 
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
 
  // Form state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState({
    title: "", description: "", subject: "", class: "",
    dueDate: "", totalMarks: "100", attachmentUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
 
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/assignments");
      setAssignments(data.assignments || []);
    } catch (error) {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchAssignments(); }, []);
 
  const fetchOptions = async () => {
    try {
      const [subRes, clsRes] = await Promise.all([
        api.get("/subjects"),
        api.get("/classes"),
      ]);
      setSubjects(subRes.data.subjects || []);
      setClasses(clsRes.data.classes || []);
    } catch (error) {
      toast.error("Failed to load options");
    }
  };
 
  const handleOpenForm = (assignment?: Assignment) => {
    fetchOptions();
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject._id,
        class: assignment.class._id,
        dueDate: assignment.dueDate.split("T")[0],
        totalMarks: assignment.totalMarks.toString(),
        attachmentUrl: "",
      });
    } else {
      setEditingAssignment(null);
      setFormData({ title: "", description: "", subject: "", class: "", dueDate: "", totalMarks: "100", attachmentUrl: "" });
    }
    setIsFormOpen(true);
  };
 
  const handleSubmit = async () => {
    if (!formData.title || !formData.subject || !formData.class || !formData.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setSubmitting(true);
      const payload = { ...formData, totalMarks: parseInt(formData.totalMarks) };
      if (editingAssignment) {
        await api.patch(`/assignments/update/${editingAssignment._id}`, payload);
        toast.success("Assignment updated");
      } else {
        await api.post("/assignments/create", payload);
        toast.success("Assignment created");
      }
      setIsFormOpen(false);
      fetchAssignments();
    } catch (error) {
      toast.error("Failed to save assignment");
    } finally {
      setSubmitting(false);
    }
  };
 
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/assignments/delete/${deleteId}`);
      toast.success("Assignment deleted");
      fetchAssignments();
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };
 
  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();
 
  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
 
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            {isTeacher ? "Create and manage assignments." : "View your pending assignments."}
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => handleOpenForm()}>
            <Plus className="mr-2 h-4 w-4" /> New Assignment
          </Button>
        )}
      </div>
 
      {assignments.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center border rounded-lg border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg">No Assignments</h3>
          <p className="text-muted-foreground text-sm">
            {isTeacher ? "Create your first assignment." : "No assignments yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((a) => (
            <Card key={a._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={isOverdue(a.dueDate) ? "destructive" : "default"}>
                    {isOverdue(a.dueDate) ? "Overdue" : "Active"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {a.totalMarks} marks
                  </span>
                </div>
                <CardTitle className="text-lg">{a.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {a.subject?.name}
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {a.class?.name}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Due: {new Date(a.dueDate).toLocaleDateString()}
                </div>
              </CardContent>
              {isTeacher && (
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenForm(a)}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1"
                    onClick={() => { setDeleteId(a._id); setIsDeleteOpen(true); }}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
 
      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAssignment ? "Edit Assignment" : "New Assignment"}</DialogTitle>
            <DialogDescription>Fill in the assignment details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Assignment title" />
            </div>
            <div>
              <Label>Description *</Label>
              <textarea
                className="w-full border rounded-md p-2 text-sm min-h-20 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the assignment..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Subject *</Label>
                <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Class *</Label>
                <Select value={formData.class} onValueChange={(v) => setFormData({ ...formData, class: v })}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date *</Label>
                <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
              </div>
              <div>
                <Label>Total Marks</Label>
                <Input type="number" value={formData.totalMarks} onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Attachment URL (optional)</Label>
              <Input value={formData.attachmentUrl} onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })} placeholder="https://..." />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingAssignment ? "Update Assignment" : "Create Assignment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
 
      <CustomAlert
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        handleDelete={handleDelete}
        title="Delete Assignment"
        description="Are you sure? This cannot be undone."
      />
    </div>
  );
};
 
export default Assignments;