import { Construction } from "lucide-react";
 
interface Props {
  title?: string;
}
 
const ComingSoon = ({ title = "This Page" }: Props) => {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-4 p-8">
      <Construction className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground max-w-sm">
        This feature is under construction and will be available soon.
      </p>
    </div>
  );
};
 
export default ComingSoon;
 