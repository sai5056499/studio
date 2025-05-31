
"use client";
import { AppHeader } from "@/components/layout/app-header";
import { ChatPanel } from "@/components/chat/chat-panel";
import { TaskSummaryWidget } from "@/components/dashboard/task-summary-widget";
import { HabitStreaksWidget } from "@/components/dashboard/habit-streaks-widget";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function HomePage() { // Renamed from ChatPage
  return (
    <div className="flex h-full flex-col"> {/* Changed height to full for better scroll */}
      <AppHeader title="Dashboard & AI Chat" /> {/* Updated title */}
      <ScrollArea className="flex-1"> {/* Added ScrollArea for the whole page content */}
        <main className="p-4 md:p-6 space-y-8"> {/* Added padding and spacing */}
          {/* Dashboard Widgets Section */}
          <section id="dashboard-widgets">
            <div className="grid gap-6">
              <TaskSummaryWidget />
              <HabitStreaksWidget />
              {/* Future widgets can be added here */}
            </div>
          </section>

          {/* Chat Panel Section - made it take less vertical space initially */}
          <section id="chat-panel-section" className="h-[calc(100svh-200px)] md:h-auto md:min-h-[500px] flex flex-col">
             <h2 className="text-xl font-semibold mb-4">AI Chat Assistant</h2>
            <div className="flex-grow rounded-lg border shadow-sm overflow-hidden">
                <ChatPanel />
            </div>
          </section>
        </main>
      </ScrollArea>
    </div>
  );
}
