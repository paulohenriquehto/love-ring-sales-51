import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-12 sm:h-14 flex items-center justify-between border-b bg-background px-3 sm:px-4 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9" />
              <div className="hidden sm:block text-sm text-muted-foreground">
                Sistema Interno InLove Store
              </div>
            </div>
            {/* Mobile title - visible only on small screens */}
            <div className="sm:hidden text-xs text-muted-foreground font-medium">
              InLove Store
            </div>
          </header>
          <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}