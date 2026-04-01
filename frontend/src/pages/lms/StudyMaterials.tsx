import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { toast } from "sonner";
import {
  Plus, FileText, Link, Video, BookOpen, Loader2, Trash2, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
 
type MaterialType = "notes" | "video" | "link" | "document";
 
interface Material {
  _id: string;
  title: string;
  description?: string;
  subject: { _id: string; name: string; code: string };
  class: { _id: string; name: string };
  teacher: { _id: string; name: string };
  type: MaterialType;
  url: string;
  isActive: boolean;
  createdAt: string;
}
 
interface Subject { _id: string; name: string; }
interface Class { _id: string; name: string; }
 
const typeIcons: Record<MaterialType, React.ReactNode> = {
  notes: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  link: <Link className="h-4 w-4" />,
  document: <BookOpen className="h-4 w-4" />,
};
 
const typeColors: Record<MaterialType, string> = {
  notes: "bg-blue-100 text-blue-700",
  video: "bg-red-100 text-red-700",
  link: "bg-green-100 text-green-700",
  document: "bg-purple-100 text-purple-700",
};
 
const StudyMaterials = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher" || user?.role === "admin";
 
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", subject: "",
    class: "", type: "notes" as MaterialType, url: "",
  });
 
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/materials");
      setMaterials(data.materials || []);
    } catch (error) {
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchMaterials(); }, []);
 
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
 
  const handleOpenForm = () => {
    fetchOptions();
    setFormData({ title: "", description: "", subject: "", class: "", type: "notes", url: "" });
    setIsFormOpen(true);
  };
 
  const handleSubmit = async () => {
    if (!formData.title || !formData.subject || !formData.class || !formData.url) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/materials/create", formData);
      toast.success("Material uploaded successfully");
      setIsFormOpen(false);
      fetchMaterials();
    } catch (error) {
      toast.error("Failed to upload material");
    } finally {
      setSubmitting(false);
    }
  };
 
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/materials/delete/${deleteId}`);
      toast.success("Material deleted");
      fetchMaterials();
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };
 
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
          <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
          <p className="text-muted-foreground">
            {isTeacher ? "Upload and manage learning resources." : "Access your study materials."}
          </p>
        </div>
        {isTeacher && (
          <Button onClick={handleOpenForm}>
            <Plus className="mr-2 h-4 w-4" /> Upload Material
          </Button>
        )}
      </div>
 
      {materials.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center border rounded-lg border-dashed">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg">No Materials</h3>
          <p className="text-muted-foreground text-sm">
            {isTeacher ? "Upload your first study material." : "No materials available yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m) => (
            <Card key={m._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${typeColors[m.type]}`}>
                    {typeIcons[m.type]}
                    {m.type.charAt(0).toUpperCase() + m.type.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg">{m.title}</CardTitle>
                {m.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {m.subject?.name}
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {m.class?.name}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(m.url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> Open
                </Button>
                {isTeacher && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => { setDeleteId(m._id); setIsDeleteOpen(true); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
 
      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Study Material</DialogTitle>
            <DialogDescription>Add a new resource for students.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Chapter 3 Notes"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description (optional)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as MaterialType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notes">Notes</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject *</Label>
                <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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
            <div>
              <Label>URL / Link *</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Uploading..." : "Upload Material"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
 
      <CustomAlert
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        handleDelete={handleDelete}
        title="Delete Material"
        description="Are you sure? This cannot be undone."
      />
    </div>
  );
};
 
export default StudyMaterials;
