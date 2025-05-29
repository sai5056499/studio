
"use client";

import type { ChatMessage } from "@/lib/types"; 
import type { AiPoweredTaskPlanningOutput } from "@/ai/flows/ai-powered-task-planning"; 
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Removed AvatarImage as it's not used
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Card related imports seem unused here, but might be for future if messages become cards themselves.
import { Bot, User, AlertTriangle, CheckCircle, Sparkles } from "lucide-react"; // Removed ClipboardList, ChevronRight
import { format } from "date-fns";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


interface ChatMessageCardProps {
  message: ChatMessage;
}

export function ChatMessageCard({ message }: ChatMessageCardProps) {
  const { toast } = useToast();
  const isUser = message.role === "user";
  const isSystem = message.role === "system"; 
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
        if (message.data && "taskName" in message.data && "dailyTasks" in message.data) {
          const planData = message.data as AiPoweredTaskPlanningOutput; // Uses the imported type
          return (
            <div>
              <h4 className="font-semibold mb-1">Task Plan Generated: {planData.taskName}</h4>
              {planData.overallReminder && <p className="text-sm italic mb-2">Reminder: {planData.overallReminder}</p>}
              <p className="text-sm mb-2">Status: {planData.status || "Todo (Default)"}</p> {/* Display status */}
              
              <h5 className="font-medium mt-2 mb-1 text-sm">Daily Breakdown:</h5>
              {planData.dailyTasks && planData.dailyTasks.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {planData.dailyTasks.map((dailyTask, index) => (
                    <AccordionItem value={`chat-day-${message.id}-${index}`} key={index} className="border-b-muted/50">
                      <AccordionTrigger className="text-xs font-medium hover:no-underline py-1.5 px-1 text-left">
                        {dailyTask.dayDescription}
                      </AccordionTrigger>
                      <AccordionContent className="pl-3 pt-1 pb-1 text-xs">
                        <ul className="list-none space-y-0.5">
                          {dailyTask.subTasks.map((subTask, subIndex) => (
                            <li key={subIndex} className="flex items-start">
                              <CheckCircle className="mr-1.5 mt-0.5 h-3 w-3 text-green-400 shrink-0" />
                              <span>{subTask}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-xs text-muted-foreground">No daily steps provided.</p>
              )}
               <p className="text-xs mt-2 text-muted-foreground">You can view and manage this task in the "Task Planning" page.</p>
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
          "shadow-md text-sm" 
        )}>
          {renderContent()}
        </div>
        <p className={cn(
            "text-xs text-muted-foreground mt-1",
            isUser ? "text-right pr-1" : "text-left pl-1"
          )}>
          {format(new Date(message.timestamp), "PPpp")} {/* Ensure timestamp is a Date object */}
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
