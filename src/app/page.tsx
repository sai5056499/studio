import { AppHeader } from "@/components/layout/app-header";
import { ChatPanel } from "@/components/chat/chat-panel";

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100svh-theme(spacing.16))] flex-col md:h-svh">
      <AppHeader title="Chat with AI" />
      <main className="flex-1 overflow-hidden">
        <ChatPanel />
      </main>
    </div>
  );
}
