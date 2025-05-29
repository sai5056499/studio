"use client";

import type { ChatMessage, PlannedTask } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, User, AlertTriangle, CheckCircle, Sparkles, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";

interface ChatMessageCardProps {
  message: ChatMessage;
}

export function ChatMessageCard({ message }: ChatMessageCardProps) {
  const { toast } = useToast();
  const isUser = message.role === "user";
  const isSystem = message.role === "system"; // e.g. for page content input
  const isError = message.type === "error";

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard!",
          description: `${type} has been copied.`,
          variant: "default",
        });
      })
      .catch(err => {
        toast({
          title: "Failed to copy",
          description: `Could not copy ${type}: ${err}`,
          variant: "destructive",
        });
      });
  };

  const renderContent = () => {
    if (isError && message.data && typeof message.data === 'object' && 'error' in message.data) {
      return <p className="text-destructive-foreground">{String(message.data.error)}</p>;
    }
    
    switch (message.type) {
      case "summary":
        if (message.data && "summary" in message.data) {
          const summaryData = message.data as { summary: string };
          return (
            <div>
              <h4 className="font-semibold mb-1">Page Summary:</h4>
              <p>{summaryData.summary}</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => copyToClipboard(summaryData.summary, "Summary")}>
                <Sparkles className="mr-2 h-4 w-4" /> Copy Summary
              </Button>
            </div>
          );
        }
        return <p>{message.content}</p>;
      case "improvement":
        if (message.data && "improvedContent" in message.data && "explanation" in message.data) {
          const improvementData = message.data as { improvedContent: string; explanation: string };
          return (
            <div>
              <h4 className="font-semibold mb-1">Content Improvement Suggestions:</h4>
              <p className="italic mb-2 text-sm">Explanation: {improvementData.explanation}</p>
              <pre className="whitespace-pre-wrap bg-muted p-2 rounded-md text-sm">{improvementData.improvedContent}</pre>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => copyToClipboard(improvementData.improvedContent, "Improved Content")}>
                 <Sparkles className="mr-2 h-4 w-4" /> Copy Improved Content
              </Button>
            </div>
          );
        }
        return <p>{message.content}</p>;
      case "plan":
        if (message.data && "taskName" in message.data) {
          const planData = message.data as PlannedTask; // Assuming it fits PlannedTask structure
          return (
            <div>
              <h4 className="font-semibold mb-1">Task Plan: {planData.taskName}</h4>
              <p className="text-sm italic">Reminder: {planData.reminder}</p>
              <h5 className="font-medium mt-2 mb-1">Steps:</h5>
              <ul className="list-disc list-inside text-sm">
                {planData.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          );
        }
        return <p>{message.content}</p>;
      default:
        return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg shadow-sm",
        isUser ? "bg-primary/10 justify-end" : "bg-secondary/20",
        isSystem ? "bg-muted/30 border border-dashed" : "",
        isError ? "bg-destructive/20 border border-destructive" : "border border-transparent"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className={cn(
            isError ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
          )}>
            {isError ? <AlertTriangle size={18} /> : <Bot size={18} />}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex-1 max-w-[85%]", isUser ? "text-right" : "text-left")}>
        <div className={cn(
          "p-3 rounded-lg",
          isUser ? "bg-primary text-primary-foreground" : (isError ? "bg-destructive text-destructive-foreground" : "bg-card text-card-foreground"),
          "shadow-md"
        )}>
          {renderContent()}
        </div>
        <p className={cn(
            "text-xs text-muted-foreground mt-1",
            isUser ? "text-right pr-1" : "text-left pl-1"
          )}>
          {format(message.timestamp, "PPpp")}
        </p>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <User size={18} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
