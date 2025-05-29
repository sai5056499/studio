"use client";

import { AppHeader } from "@/components/layout/app-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageCard } from "@/components/chat/chat-message-card";
import { useChat } from "@/contexts/chat-context";
import { History, MessageSquareText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ChatHistoryPage() {
  const { messages } = useChat();

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Chat History" />
      <main className="flex-1 overflow-hidden p-4 md:p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Alert className="max-w-md bg-primary/5">
              <History className="h-5 w-5 text-primary" />
              <AlertTitle className="font-semibold text-primary">No Chat History Yet</AlertTitle>
              <AlertDescription className="text-foreground/80">
                Your conversations will appear here once you start chatting with the AI.
              </AlertDescription>
              <div className="mt-4">
                <Button asChild variant="outline">
                  <Link href="/">
                    <MessageSquareText className="mr-2 h-4 w-4" /> Start Chatting
                  </Link>
                </Button>
              </div>
            </Alert>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-8rem)]"> {/* Adjust height as needed */}
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatMessageCard key={msg.id} message={msg} />
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
