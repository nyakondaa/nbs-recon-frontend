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

import { getLoggedInUser } from '../services/logedUserHelper'

interface AppSidebarProps {
  currentPathname?: string // pass current pathname from the client
}

const nbsDarkGreen = 'bg-nbs-dark-green'
const nbsLightGreen = 'bg-nbs-light-green'
const nbsOffWhiteText = 'text-nbs-off-white'
const nbsLightGreenText = 'text-nbs-light-green'

export async function AppSidebar({ currentPathname }: AppSidebarProps) {
  const user = await getLoggedInUser()

  const items = [
    { title: 'Home', url: '/dashboard', icon: Home },
    { title: 'Reports', url: '/dashboard/reports', icon: Inbox },
    ...(user?.role === 'admin' || 'ADMIN'
      ? [{ title: 'Users', url: '/dashboard/users', icon: Users }]
      : []),
    { title: 'Settings', url: '/dashboard/settings', icon: Settings },
  ]

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className='space-y-3.5'>
          <SidebarGroupLabel className="mt-5 items-center">
            <img
              src="/nbs-logo.png"
              alt="NBS Logo"
              className="w-16 h-16  my-4"
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
                const isActive = currentPathname === item.url
                return (
                  <SidebarMenuItem key={item.title} className="spaxce-y-2">
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                    ${nbsOffWhiteText} 
                    hover:${nbsLightGreen} hover:text-white
                    ${isActive ? 'bg-green-700 text-white' : ''}
                    `}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
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
