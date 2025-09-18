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

// Assuming you've already defined these colors in tailwind.config.js or globals.css
const nbsDarkGreen = "bg-nbs-dark-green"; // Tailwind CSS class for background
const nbsLightGreen = "bg-nbs-light-green"; // Tailwind CSS class for hover background
const nbsOffWhiteText = "text-nbs-off-white"; // Tailwind CSS class for text color
const nbsLightGreenText = "text-nbs-light-green"; // Tailwind CSS class for highlight text color

// Menu items
const items = [
  { title: "Home", url: "/main", icon: Home },
  { title: "Inbox", url: "/main/inbox", icon: Inbox },
  { title: "Calendar", url: "/main/calendar", icon: Calendar },
  { title: "Search", url: "/main/search", icon: Search },
  { title: "Settings", url: "/main/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="space-x-2 " >
           <img src="/nbs-logo.png" alt="NBS Logo" className="w-12 h-12  my-4"/>
            <h1 className={`text-xl font-bold text-center ${nbsLightGreenText}`}>
              Reconciliation
            </h1>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-5">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${nbsOffWhiteText} hover:${nbsLightGreen} hover:text-white`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}