
import { AppHeader } from "@/components/layout/app-header";
import { ChatPanel } from "@/components/chat/chat-panel";
import RotatingCube from "@/components/decorative/rotating-cube"; // Import the new component

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100svh-theme(spacing.16))] flex-col md:h-svh">
      <AppHeader title="Chat with AI" />
      <main className="flex-1 overflow-hidden">
        {/*
          Conditionally render RotatingCube here if you want it only for the empty state.
          For simplicity in this change, ChatPanel itself handles its empty state.
          If RotatingCube should be part of ChatPanel's empty state, ChatPanel needs modification.
          Let's add it to ChatPanel's empty state.
        */}
        <ChatPanel />
      </main>
    </div>
  );
}
