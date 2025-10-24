"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Calendar, Home, Inbox, Search, Settings, Users } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function AppSidebar() {
  const pathname = usePathname() // automatically updates on client-side navigation
  const [user, setUser] = useState(null)

  const nbsDarkGreen = "bg-nbs-dark-green"
  const nbsLightGreen = "bg-nbs-light-green"
  const nbsOffWhiteText = "text-nbs-off-white"
  const nbsLightGreenText = "text-nbs-light-green"

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Failed to fetch user:", err))
  }, [])

  const items = [
    { title: "Home", url: "/dashboard", icon: Home },
    { title: "Reports", url: "/dashboard/reports", icon: Inbox },
    ...(user?.role?.toLowerCase() === "admin"
      ? [{ title: "Users", url: "/dashboard/users", icon: Users }]
      : []),
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ]

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="space-y-3.5">
          <SidebarGroupLabel className="mt-5 items-center">
            <img
              src="nbs-logo.png"
              alt="NBS Logo"
              className="w-16 h-16 rounded-lg my-4"
            />
            <h1
              className={`text-xl font-bold text-center mt-2 ${nbsLightGreenText}`}
            >
              Reconciliation
            </h1>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-5">
              {items.map((item) => {
                const isActive =
                  item.url === "/dashboard"
                    ? pathname === "/dashboard" || pathname === "/"
                    : pathname.startsWith(item.url)

                return (
                  <SidebarMenuItem key={item.title} className="space-y-2">
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                          ${nbsOffWhiteText} 
                          hover:bg-green-700 hover:text-white
                          ${isActive ? "bg-green-700 text-white font-semibold shadow-md" : ""}
                        `}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
