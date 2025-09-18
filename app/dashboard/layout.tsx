import { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
export default function DashboardLayout({ children }: { children: ReactNode }) {

  return (
    <SidebarProvider>
        
            <div className="flex h-screen">
            <AppSidebar />
            <main className="flex-1">
                <SidebarTrigger/>
                {children}
            </main>
            </div>           
      
    </SidebarProvider>
  );
}
