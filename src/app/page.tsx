
"use client";
import { AppHeader } from "@/components/layout/app-header";
import { ChatPanel } from "@/components/chat/chat-panel";
import { TaskSummaryWidget } from "@/components/dashboard/task-summary-widget";
import { HabitStreaksWidget } from "@/components/dashboard/habit-streaks-widget";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function HomePage() {
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Dashboard" />
      {/*
        Main content area uses flexbox.
        - Stacks vertically by default (for mobile).
        - Switches to horizontal layout (side-by-side) on medium screens and up (md:flex-row).
        - overflow-hidden is important for child ScrollAreas/flex-grow to work correctly.
        - gap-6 provides spacing between the columns.
      */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 md:p-6 gap-6">
        {/* Left Column: Chat Panel */}
        {/*
          - flex-1 makes it take the primary width on md+ screens when side-by-side.
          - flex flex-col allows the ChatPanel container to grow.
        */}
        <div className="flex-1 flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4 hidden md:block">AI Chat Assistant</h2> {/* Title for chat, hidden on mobile */}
          {/*
            - flex-grow allows this container to fill the vertical space of the left column.
            - ChatPanel component has its own internal scrolling.
          */}
          <div className="flex-grow rounded-lg border border-input bg-card shadow-sm overflow-hidden">
            <ChatPanel />
          </div>
        </div>

        {/* Right Column: Dashboard Widgets */}
        {/*
          - On mobile (stacked layout), takes full width implicitly.
          - On medium screens, takes 2/5 width. On large screens, 1/3 width.
          - ScrollArea handles overflow for the widgets within this column.
        */}
        <ScrollArea className="w-full md:w-2/5 lg:w-1/3">
          <div className="space-y-6">
            <TaskSummaryWidget />
            <HabitStreaksWidget />
            {/* Future widgets can be added here */}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
