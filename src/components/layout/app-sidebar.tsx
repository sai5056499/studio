
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { AppLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  ListChecks, 
  History, 
  LogOut, 
  Settings, 
  PenSquare, 
  Languages, 
  ScanText, 
  FileQuestion,
  Zap,         
  BarChart3,   
  MessageSquare
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/writer", label: "AI Writer", icon: PenSquare },
  { href: "/translate", label: "Translate", icon: Languages },
  { href: "/ocr", label: "OCR", icon: ScanText },
  { href: "/chat-pdf", label: "Chat PDF", icon: FileQuestion },
  { href: "/planning", label: "Task Planning", icon: ListChecks },
  { href: "/habits", label: "Habits", icon: Zap }, 
  { href: "/analytics", label: "Analytics", icon: BarChart3 }, 
  { href: "/history", label: "Chat History", icon: History },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/" passHref legacyBehavior>
          <a className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-sm">
            <AppLogo className="h-8 w-8 text-sidebar-primary" />
            <span className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Content Ally
            </span>
          </a>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarMenu className="p-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: "right" }}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator className="my-0 bg-sidebar-border" />
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/settings" legacyBehavior passHref>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/settings"}
                tooltip={{ children: "Settings", side: "right" }}
                className="justify-start"
              >
                <a>
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <SidebarMenuButton 
              tooltip={{ children: "Logout", side: "right" }}
              className="justify-start"
              // onClick={() => { /* TODO: Implement logout */ }}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
