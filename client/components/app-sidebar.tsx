"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, User, Users, ChefHat, Wifi, Droplets, Car, Trash2 } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

// Common navigation items for all roles
const commonItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
]

// Role-specific navigation items
const roleSpecificItems = {
  student: [
    {
      title: "My Complaints",
      url: "/dashboard/student/complaints",
      icon: Users,
    },
    {
      title: "Submit Complaint",
      url: "/dashboard/student/submit",
      icon: Users,
    },
  ],
  admin: [
    {
      title: "All Complaints",
      url: "/dashboard/admin/complaints",
      icon: Users,
    },
    {
      title: "User Management",
      url: "/dashboard/admin/users",
      icon: Users,
    },
    {
      title: "Reports",
      url: "/dashboard/admin/reports",
      icon: Users,
    },
  ],
  mess: [
    {
      title: "Mess Complaints",
      url: "/dashboard/mess/complaints",
      icon: ChefHat,
    },
    {
      title: "Mess Management",
      url: "/dashboard/mess/management",
      icon: ChefHat,
    },
  ],
  water: [
    {
      title: "Water Complaints",
      url: "/dashboard/water/complaints",
      icon: Droplets,
    },
    {
      title: "Water Management",
      url: "/dashboard/water/management",
      icon: Droplets,
    },
  ],
  cleaning: [
    {
      title: "Cleaning Complaints",
      url: "/dashboard/cleaning/complaints",
      icon: Trash2,
    },
    {
      title: "Cleaning Schedule",
      url: "/dashboard/cleaning/schedule",
      icon: Trash2,
    },
  ],
  internet: [
    {
      title: "Internet Complaints",
      url: "/dashboard/internet/complaints",
      icon: Wifi,
    },
    {
      title: "Network Status",
      url: "/dashboard/internet/status",
      icon: Wifi,
    },
  ],
  transport: [
    {
      title: "Transport Complaints",
      url: "/dashboard/transport/complaints",
      icon: Car,
    },
    {
      title: "Vehicle Management",
      url: "/dashboard/transport/vehicles",
      icon: Car,
    },
  ],
}

interface AppSidebarProps {
  userRole?: 'student' | 'admin' | 'mess' | 'water' | 'cleaning' | 'internet' | 'transport'
}

export function AppSidebar({ userRole = 'student' }: AppSidebarProps) {
  const pathname = usePathname()
  
  // Get role from pathname if not provided
  const currentRole = userRole || pathname.split('/')[2] as keyof typeof roleSpecificItems || 'student'
  
  const navigationItems = [
    ...commonItems,
    ...(roleSpecificItems[currentRole] || [])
  ]

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      student: 'Student',
      admin: 'Administrator',
      mess: 'Mess Department',
      water: 'Water Department',
      cleaning: 'Cleaning Department',
      internet: 'Internet Department',
      transport: 'Transport Department',
    }
    return roleNames[role as keyof typeof roleNames] || 'User'
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatars/user.png" />
            <AvatarFallback>{getRoleDisplayName(currentRole).charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Samadhaan</span>
            <span className="text-xs text-muted-foreground">
              {getRoleDisplayName(currentRole)}
            </span>
          </div>
        </div>
        <Separator className="mt-4" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    className="w-full"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground text-center">
          Hostel Complaint Management System
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}