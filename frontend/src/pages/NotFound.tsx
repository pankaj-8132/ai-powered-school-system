import { Link } from "react-router";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
 
export const NotFound = () => {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-3xl font-bold">404 — Page Not Found</h1>
      <p className="text-muted-foreground max-w-sm">
        This page doesn't exist or hasn't been built yet.
      </p>
      <Button asChild>
        <Link to="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
};
 
export default NotFound;
 