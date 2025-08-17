
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
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 md:p-6 gap-6">
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-grow rounded-lg border border-input bg-card shadow-sm overflow-hidden">
            <ChatPanel />
          </div>
        </div>

        <ScrollArea className="w-full md:w-2/5 lg:w-1/3">
          <div className="space-y-6">
            <TaskSummaryWidget />
            <HabitStreaksWidget />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
