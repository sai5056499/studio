
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ChatProvider } from "@/contexts/chat-context";
import { TaskProvider } from "@/contexts/task-context";
import { HabitProvider } from "@/contexts/habit-context"; // Import HabitProvider
import ScrollReactiveBackground from '@/components/layout/ScrollReactiveBackground';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Content Ally",
  description: "Your AI assistant for web content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScrollReactiveBackground />
        <ChatProvider>
          <TaskProvider>
            <HabitProvider> {/* Wrap with HabitProvider */}
              <SidebarProvider defaultOpen={false}>
                <AppSidebar />
                <SidebarRail />
                <SidebarInset>
                  {children}
                </SidebarInset>
              </SidebarProvider>
            </HabitProvider>
          </TaskProvider>
        </ChatProvider>
        <Toaster />
      </body>
    </html>
  );
}
