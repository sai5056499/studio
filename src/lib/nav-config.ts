
import { 
  LayoutDashboard, 
  ListChecks, 
  History, 
  Settings, 
  PenSquare, 
  Languages, 
  ScanText, 
  FileQuestion,
  Zap,         
  BarChart3,
  Bot,   
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const defaultNavItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/writer", label: "AI Writer", icon: PenSquare },
  { href: "/translate", label: "Translate", icon: Languages },
  { href: "/ocr", label: "OCR", icon: ScanText },
  { href: "/chat-pdf", label: "Chat PDF", icon: FileQuestion },
  { href: "/research", label: "Research Agent", icon: Bot },
  { href: "/planning", label: "Task Planning", icon: ListChecks },
  { href: "/habits", label: "Habits", icon: Zap }, 
  { href: "/analytics", label: "Analytics", icon: BarChart3 }, 
  { href: "/history", label: "Chat History", icon: History },
];

export const bottomNavItems: NavItem[] = [
    { href: "/settings", label: "Settings", icon: Settings },
];

export const SIDEBAR_ORDER_STORAGE_KEY = "contentAllySidebarOrder";
