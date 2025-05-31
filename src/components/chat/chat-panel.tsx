
"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageCard } from "./chat-message-card";
import { PageContentModal } from "./page-content-modal";
import { useChat } from "@/contexts/chat-context";
import { summarizePageContent, type SummarizePageContentInput } from "@/ai/flows/summarize-page-content";
import { improvePageContent, type ImprovePageContentInput } from "@/ai/flows/improve-page-content";
import { useToast } from "@/hooks/use-toast";
import { 
  SendHorizonal, 
  FileText, 
  Edit3, 
  Loader2, 
  Trash2, 
  Clipboard, 
  Wand2, 
  ListChecks, 
  History 
} from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import RotatingCube from "@/components/decorative/rotating-cube"; // Import the cube

export function ChatPanel() {
  const { messages, addMessage, addMessages, clearChat, isLoading, setIsLoading } = useChat();
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleGenericAICall = async (
    aiFunction: (input: any) => Promise<any>,
    inputData: any,
    userMessageContent: string,
    messageType: ChatMessage["type"]
  ) => {
    setIsLoading(true);
    try {
      const result = await aiFunction(inputData);
      addMessage({
        id: Date.now().toString(),
        role: "assistant",
        content: typeof result === 'string' ? result : JSON.stringify(result),
        timestamp: new Date(),
        type: messageType,
        data: result,
      });
    } catch (error) {
      console.error(`Error calling AI for ${messageType}:`, error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      addMessage({
        id: Date.now().toString(),
        role: "assistant",
        content: `Sorry, I couldn't process that request: ${errorMessage}`,
        timestamp: new Date(),
        type: "error",
        data: { error: errorMessage },
      });
      toast({
        title: `Error during ${messageType}`,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = (pageContent: string, sourceUrl?: string) => {
    const userDisplayContent = `Please summarize the content ${sourceUrl ? `from ${sourceUrl}` : 'provided'}.`;
    const systemMessageContent = `Content for summarization${sourceUrl ? ` from ${sourceUrl}` : ''}:\n\n${pageContent.substring(0, 500)}${pageContent.length > 500 ? '...' : ''}`;
    
    addMessages([
      {
        id: (Date.now() -1).toString(),
        role: "system",
        content: systemMessageContent,
        timestamp: new Date(),
      },
      {
        id: Date.now().toString(),
        role: "user",
        content: userDisplayContent,
        timestamp: new Date(),
      }
    ]);
    startTransition(() => {
      handleGenericAICall(summarizePageContent, { pageContent } as SummarizePageContentInput, userDisplayContent, "summary");
    });
  };

  const handleImproveContent = (pageContent: string, sourceUrl?: string) => {
    const userDisplayContent = `Please provide improvement suggestions for the content ${sourceUrl ? `from ${sourceUrl}` : 'provided'}.`;
    const systemMessageContent = `Content for improvement${sourceUrl ? ` from ${sourceUrl}` : ''}:\n\n${pageContent.substring(0, 500)}${pageContent.length > 500 ? '...' : ''}`;
    
    addMessages([
      {
        id: (Date.now() -1).toString(),
        role: "system",
        content: systemMessageContent,
        timestamp: new Date(),
      },
      {
        id: Date.now().toString(),
        role: "user",
        content: userDisplayContent,
        timestamp: new Date(),
      }
    ]);
    startTransition(() => {
      handleGenericAICall(improvePageContent, { pageContent } as ImprovePageContentInput, userDisplayContent, "improvement");
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isPending) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    addMessage(newUserMessage);
    
    startTransition(async () => {
      setIsLoading(true);
      // Simulate AI response for generic messages
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating network delay
      addMessage({
        id: (Date.now() + 1).toString(), // Ensure unique ID
        role: "assistant",
        content: "I've received your message. You can use the buttons above for specific actions like summarizing or improving content, or use the Task Planning page.",
        timestamp: new Date(),
        type: "text",
      });
      setIsLoading(false);
    });

    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex gap-2">
          <PageContentModal
            triggerButton={
              <Button variant="outline" size="sm" disabled={isLoading || isPending}>
                <FileText className="mr-2 h-4 w-4" /> Analyze Page
              </Button>
            }
            title="Analyze Page Content"
            description="Paste the content of the webpage you want to analyze or summarize."
            actionButtonText="Summarize Content"
            onConfirm={handleSummarize}
          />
          <PageContentModal
            triggerButton={
              <Button variant="outline" size="sm" disabled={isLoading || isPending}>
                <Edit3 className="mr-2 h-4 w-4" /> Improve Content
              </Button>
            }
            title="Improve Page Content"
            description="Paste the content you want AI-powered improvement suggestions for."
            actionButtonText="Get Suggestions"
            onConfirm={handleImproveContent}
          />
        </div>
         <Button variant="ghost" size="icon" onClick={clearChat} disabled={isLoading || isPending || messages.length === 0} aria-label="Clear chat">
            <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
          </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 && !isLoading && !isPending ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <RotatingCube /> {/* Added the cube here */}
            <div className="mb-10">
              <h2 className="text-4xl font-bold tracking-tight mb-2 text-primary">Hi,</h2>
              <p className="text-2xl text-foreground/80">How can I assist you today?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl w-full">
              <PageContentModal
                triggerButton={
                  <Button variant="outline" className="w-full justify-start p-5 text-left h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <Clipboard className="mr-3 h-6 w-6 text-primary/80" />
                    <div>
                      <span className="font-semibold text-base text-foreground">Analyze Page Content</span>
                      <p className="text-xs text-muted-foreground">Summarize or get insights from a webpage.</p>
                    </div>
                  </Button>
                }
                title="Analyze Page Content"
                description="Paste the content of the webpage you want to analyze or summarize."
                actionButtonText="Summarize Content"
                onConfirm={handleSummarize}
              />
              <PageContentModal
                triggerButton={
                  <Button variant="outline" className="w-full justify-start p-5 text-left h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <Wand2 className="mr-3 h-6 w-6 text-primary/80" />
                    <div>
                      <span className="font-semibold text-base text-foreground">Improve Text</span>
                      <p className="text-xs text-muted-foreground">Get AI suggestions for grammar and style.</p>
                    </div>
                  </Button>
                }
                title="Improve Page Content"
                description="Paste the content you want AI-powered improvement suggestions for."
                actionButtonText="Get Suggestions"
                onConfirm={handleImproveContent}
              />
              <Button asChild variant="outline" className="w-full justify-start p-5 text-left h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Link href="/planning">
                  <ListChecks className="mr-3 h-6 w-6 text-primary/80" />
                  <div>
                    <span className="font-semibold text-base text-foreground">Plan a New Task</span>
                    <p className="text-xs text-muted-foreground">Let AI help you break down tasks.</p>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start p-5 text-left h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Link href="/history">
                  <History className="mr-3 h-6 w-6 text-primary/80" />
                  <div>
                    <span className="font-semibold text-base text-foreground">View Chat History</span>
                    <p className="text-xs text-muted-foreground">Review your past conversations.</p>
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessageCard key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            disabled={isLoading || isPending}
          />
          <Button type="submit" size="icon" disabled={isLoading || isPending || !input.trim()} aria-label="Send message">
            {isLoading || isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
