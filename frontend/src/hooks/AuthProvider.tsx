import { createContext, useState, useEffect, useContext } from "react";
import { api } from "@/lib/api";
import type { academicYear, user } from "@/types";
 
// ✅ Fixed: added setYear to context so components can refresh year after creating one
const AuthContext = createContext<{
  user: user | null;
  setUser: React.Dispatch<React.SetStateAction<user | null>>;
  loading: boolean;
  year: academicYear | null;
  setYear: React.Dispatch<React.SetStateAction<academicYear | null>>;
}>({
  user: null,
  setUser: () => {},
  loading: true,
  year: null,
  setYear: () => {},
});
 
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<user | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<academicYear | null>(null);
 
  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. Check if user is logged in via cookie
        const { data } = await api.get("/users/profile");
        setUser(data.user);
 
        // 2. Only fetch year after confirming auth
        try {
          const { data: yearData } = await api.get("/academic-years/current");
          setYear(yearData);
        } catch {
          // No current year set — this is fine, admin will create one
          setYear(null);
        }
      } catch (error: any) {
        // 401 is expected when not logged in — not a real error
        if (error?.response?.status !== 401) {
          console.error("Auth check failed:", error);
        }
        setUser(null);
        setYear(null);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);
 
  return (
    // ✅ Fixed: setYear now exposed so AcademicYear page can update it after creating a year
    <AuthContext.Provider value={{ user, setUser, loading, year, setYear }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
 
export const useAuth = () => useContext(AuthContext);