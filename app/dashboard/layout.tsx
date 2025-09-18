import { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
export default function DashboardLayout({ children }: { children: ReactNode }) {

  return (
    <SidebarProvider>
        
            <div className="flex w-full h-screen">
                <AppSidebar />
                    <SidebarTrigger className="text-accent"/>
                    <main className="w-full container mx-auto p-4">                        
                        {children}
                    </main>
            </div>           
      
    </SidebarProvider>
  );
}
