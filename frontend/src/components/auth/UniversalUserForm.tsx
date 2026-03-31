import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
 
import {
  type Class,
  type UserRole,
  type pagination,
  type subject,
  type user,
} from "@/types";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/global/CustomInput";
import { api } from "@/lib/api";
import { CustomSelect } from "@/components/global/CustomSelect";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/AuthProvider";
import { CustomMultiSelect } from "@/components/global/CustomMultiSelect";
 
export type FormType = "login" | "create" | "update";
interface Props {
  type: FormType;
  initialData?: user | null;
  onSuccess?: () => void;
  role?: UserRole;
}
 
const createSchema = (type: FormType) => {
  return z
    .object({
      name:
        type === "login"
          ? z.string().optional()
          : z.string().min(2, "Name is required"),
      classId: z.string().optional(),
      subjectIds: z.array(z.string()).optional(),
      email: z.email("Invalid email address"),
      role: z.string().optional(),
      password:
        type === "update"
          ? z
              .string()
              .optional()
              .refine((val) => !val || val.length >= 6, {
                message: "Password must be at least 6 characters",
              })
          : z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword:
        type === "create"
          ? z.string().min(8, {
              message: "Password must be at least 8 characters.",
            })
          : z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (type === "create" && data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords don't match",
          path: ["confirmPassword"],
        });
      }
    });
};
 
type FormValues = z.infer<ReturnType<typeof createSchema>>;
 
const UniversalUserForm = ({ type, initialData, onSuccess, role }: Props) => {
  const isUpdate = type === "update";
  const isLogin = type === "login";
  const { setUser } = useAuth();
 
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjects, setSubjects] = useState<subject[]>([]);
 
  // ✅ Determine if this is a teacher form — check both role prop and initialData
  const isTeacherForm =
    role === "teacher" ||
    initialData?.role === "teacher" ||
    (isUpdate && (initialData as any)?.role === "teacher");
 
  const isStudentForm =
    role === "student" ||
    initialData?.role === "student" ||
    (isUpdate && (initialData as any)?.role === "student");
 
  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema(type)),
    defaultValues: {
      name: "",
      email: "",
      role: role,
      password: "",
      classId: undefined,
      subjectIds: [],
    },
  });
 
  // Fetch classes — only for non-login forms
  useEffect(() => {
    if (isLogin) return;
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const { data } = (await api.get("/classes")) as {
          data: { classes: Class[]; pagination: pagination };
        };
        setClasses(data.classes || []);
      } catch (error) {
        console.log("Failed to load classes:", error);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [isLogin]);
 
  // Fetch subjects — only for non-login forms
  useEffect(() => {
    if (isLogin) return;
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const { data } = (await api.get("/subjects")) as {
          data: { subjects: subject[]; pagination: pagination };
        };
        setSubjects(data.subjects || []);
      } catch (error) {
        console.log("Failed to load subjects:", error);
        toast.error("Failed to load subjects");
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [isLogin]);
 
  // Populate form for Update mode
  useEffect(() => {
    if (initialData && isUpdate) {
      const existingClassId =
        typeof initialData.studentClass === "object"
          ? (initialData.studentClass as any)?._id
          : initialData.studentClass;
 
      // ✅ Handle both teacherSubject (singular, from backend populate)
      // and teacherSubjects (plural, legacy)
      const rawSubjects =
        (initialData as any).teacherSubject ||
        initialData.teacherSubjects ||
        [];
      const existingSubjectIds = rawSubjects.map((s: any) =>
        typeof s === "object" ? s._id : s
      );
 
      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        role: initialData.role || "student",
        password: "",
        classId: existingClassId || "",
        subjectIds: existingSubjectIds,
      });
    }
  }, [isUpdate, initialData, form, subjects]);
 
  async function onSubmit(data: FormValues) {
    try {
      // ✅ Build payload explicitly — never spread data to avoid field name conflicts
      const payload: Record<string, any> = {
        name: data.name,
        email: data.email,
        role: data.role,
        teacherSubjects: data.subjectIds || [],
        studentClass: data.classId || undefined,
      };
 
      // Only include password if provided
      if (data.password) {
        payload.password = data.password;
      }
 
      if (isLogin) {
        const { data: responseData } = await api.post("/users/login", {
          email: data.email,
          password: data.password,
        });
        setUser(responseData.user);
        toast.success("Logged in successfully");
        window.location.href = "/dashboard";
      } else if (type === "create") {
        await api.post("/users/register", payload);
        toast.success("Account created successfully!");
        if (onSuccess) onSuccess();
      } else if (type === "update" && initialData?._id) {
        await api.put(`/users/update/${initialData._id}`, payload);
        toast.success("User updated successfully");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    }
  }
 
  const classOptions = Array.isArray(classes)
    ? classes.map((c) => ({ label: c.name, value: c._id }))
    : [];
 
  const subjectOptions = Array.isArray(subjects)
    ? subjects.map((s) => ({ label: s.name, value: s._id }))
    : [];
 
  const roleOptions = role ? [{ label: role, value: role }] : [];
 
  const pending = form.formState.isSubmitting;
 
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4 w-full">
          {/* Name */}
          {!isLogin && (
            <CustomInput
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="Jane Doe"
              disabled={pending}
            />
          )}
 
          {/* Role selector */}
          {!isLogin && (
            <CustomSelect
              control={form.control}
              name="role"
              label="Role"
              placeholder="Select role"
              options={roleOptions}
              disabled={pending}
            />
          )}
 
          <div className="col-span-2 space-y-2">
            {/* ✅ Class selector — only for students */}
            {!isLogin && isStudentForm && (
              <CustomSelect
                control={form.control}
                name="classId"
                label="Class"
                placeholder="Select Class"
                options={classOptions}
                disabled={pending}
                loading={loadingClasses}
              />
            )}
 
            {/* ✅ Subject selector — only for teachers */}
            {!isLogin && isTeacherForm && (
              <CustomMultiSelect
                control={form.control}
                name="subjectIds"
                label="Subjects"
                placeholder="Select subjects..."
                options={subjectOptions}
                loading={loadingSubjects}
                disabled={pending}
              />
            )}
 
            {/* Email */}
            <CustomInput
              control={form.control}
              name="email"
              label="Email Address"
              type="email"
              placeholder="m@example.com"
              disabled={pending}
            />
          </div>
 
          {/* Password */}
          <div className="col-span-2">
            <CustomInput
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder={isUpdate ? "New Password (Optional)" : "Password"}
              disabled={pending}
            />
          </div>
 
          {/* Confirm Password — only on create */}
          {type === "create" && (
            <div className="col-span-2">
              <CustomInput
                control={form.control}
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm Password"
                disabled={pending}
              />
            </div>
          )}
 
          {/* Submit */}
          <div className="col-span-2 mt-2">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending
                ? "Processing..."
                : type === "login"
                ? "Sign In"
                : type === "create"
                ? "Create Account"
                : "Save Changes"}
            </Button>
          </div>
        </div>
      </FieldGroup>
    </form>
  );
};
 
export default UniversalUserForm;
 