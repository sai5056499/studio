
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { ChatProvider } from "@/contexts/chat-context";
import { TaskProvider } from "@/contexts/task-context";
import { HabitProvider } from "@/contexts/habit-context";
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

// This function will run on the server and won't have access to localStorage
// But it sets a default so the body tag exists for the client to hydrate.
// The actual theme is applied client-side in settings/page.tsx or a theme context.
const getInitialTheme = () => {
  // In a real app with server-side theme persistence, you'd check cookies here.
  // For now, we default to the devias theme.
  return "devias-light";
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTheme = getInitialTheme();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        data-theme={initialTheme}
      >
        <AuthProvider>
          <ChatProvider>
            <TaskProvider>
              <HabitProvider>
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
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
