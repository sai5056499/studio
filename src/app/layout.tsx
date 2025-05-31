
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ChatProvider } from "@/contexts/chat-context";
import { TaskProvider } from "@/contexts/task-context"; // Import TaskProvider

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
        <ChatProvider>
          <TaskProvider> {/* Wrap with TaskProvider */}
            <SidebarProvider defaultOpen={false}>
              <AppSidebar />
              <SidebarRail />
              <SidebarInset>
                {children}
              </SidebarInset>
            </SidebarProvider>
          </TaskProvider>
        </ChatProvider>
        <Toaster />
      </body>
    </html>
  );
}
