
"use client";

import * as React from "react";
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
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";
import { defaultNavItems, bottomNavItems, SIDEBAR_ORDER_STORAGE_KEY, type NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";


export function AppSidebar() {
  const pathname = usePathname();
  const [orderedNavItems, setOrderedNavItems] = React.useState(defaultNavItems);

  React.useEffect(() => {
    const savedOrderJson = localStorage.getItem(SIDEBAR_ORDER_STORAGE_KEY);
    if (savedOrderJson) {
      try {
        const savedOrder: string[] = JSON.parse(savedOrderJson);
        const itemMap = new Map(defaultNavItems.map(item => [item.href, item]));
        const newOrderedItems = savedOrder
          .map(href => itemMap.get(href))
          .filter((item): item is NavItem => !!item);
        
        defaultNavItems.forEach(item => {
            if(!newOrderedItems.find(i => i.href === item.href)) {
                newOrderedItems.push(item);
            }
        });

        setOrderedNavItems(newOrderedItems);
      } catch (e) {
        console.error("Failed to parse sidebar order from localStorage", e);
        setOrderedNavItems(defaultNavItems);
      }
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SIDEBAR_ORDER_STORAGE_KEY) {
        // A simple reload is the easiest way to ensure all components get the new order
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/" passHref legacyBehavior>
          <a className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-sm">
            <AppLogo className="h-8 w-8 text-sidebar-primary" />
            <span className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Content Ally
            </span>
          </a>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarMenu className="p-2 space-y-1">
          {orderedNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: "right" }}
                  className={cn(
                    "justify-start relative",
                    pathname === item.href && "bg-sidebar-accent/50 text-sidebar-accent-foreground"
                  )}
                >
                  <a>
                    <div className={cn(
                      "absolute left-0 top-0 h-full w-1 rounded-r-full bg-transparent",
                      pathname === item.href && "bg-sidebar-primary"
                    )}></div>
                    <item.icon className="h-5 w-5 ml-1" />
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
        <SidebarMenu className="space-y-1">
          {bottomNavItems.map((item) => (
             <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: "right" }}
                  className={cn(
                    "justify-start relative",
                    pathname === item.href && "bg-sidebar-accent/50 text-sidebar-accent-foreground"
                  )}
                >
                  <a>
                    <div className={cn(
                      "absolute left-0 top-0 h-full w-1 rounded-r-full bg-transparent",
                      pathname === item.href && "bg-sidebar-primary"
                    )}></div>
                    <item.icon className="h-5 w-5 ml-1" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
             <SidebarMenuButton 
              tooltip={{ children: "Logout", side: "right" }}
              className="justify-start"
              // onClick={() => { /* TODO: Implement logout */ }}
            >
              <LogOut className="h-5 w-5 ml-1" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
