import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { toast } = useToast();

  const handleAuthClick = (action: 'Sign In' | 'Sign Up') => {
    toast({
      title: "Feature Not Implemented",
      description: `The ${action} functionality is a placeholder for a future authentication system.`,
    });
  };
  
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => handleAuthClick('Sign In')}>Sign In</Button>
        <Button size="sm" onClick={() => handleAuthClick('Sign Up')}>Sign Up</Button>
      </div>
    </header>
  );
}
