import { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { Navbar } from "../components/app-navbar";
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen">
        <AppSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Navbar at the top */}
          <Navbar children={<SidebarTrigger className="text-accent mb-4" />} />
          
          {/* Main content with sidebar trigger */}
          <main className="flex-1 overflow-auto p-6">
            
            <div className="container mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}