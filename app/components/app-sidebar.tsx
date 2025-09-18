"use client";

import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { usePathname } from "next/navigation";

// Assuming you've already defined these colors in tailwind.config.js or globals.css
const nbsDarkGreen = "bg-nbs-dark-green"; // Tailwind CSS class for background
const nbsLightGreen = "bg-nbs-light-green"; // Tailwind CSS class for hover background
const nbsOffWhiteText = "text-nbs-off-white"; // Tailwind CSS class for text color
const nbsLightGreenText = "text-nbs-light-green"; // Tailwind CSS class for highlight text color

// Menu items
const items = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Reports", url: "/dashboard/reports", icon: Inbox }, 
  { title: "Search", url: "/main/search", icon: Search },
  { title: "Settings", url: "/dashboards/settings", icon: Settings },
];



export function AppSidebar() {

    const pathname = usePathname();

  return (
    <Sidebar >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mt-5 items-center" >
           <img src="/nbs-logo.png" alt="NBS Logo" className="w-24 h-24  my-4"/>
            <h1 className={`text-xl font-bold text-center mt-2 ${nbsLightGreenText}`}>
              Reconciliation
            </h1>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-5">
              {items.map((item) => {
                 const isActive = pathname === item.url;
                 return (
                  <SidebarMenuItem key={item.title} className="spaxce-y-2">
                    <SidebarMenuButton asChild>
                     <a
                    href={item.url}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                    ${nbsOffWhiteText} 
                    hover:${nbsLightGreen} hover:text-white
                    ${isActive ? "bg-green-700 text-white" : ""}
                    `}
                      >
                    <item.icon />
                    <span>{item.title}</span>
                    </a>
                </SidebarMenuButton>
                </SidebarMenuItem>
            );
        })}
    </SidebarMenu>

          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}