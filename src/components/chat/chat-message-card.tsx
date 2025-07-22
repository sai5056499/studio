
"use client";

import type { ChatMessage, PlannedTask } from "@/lib/types"; // Use PlannedTask for chat
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, User, AlertTriangle, CheckCircle, Sparkles, Circle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge"; // Added for displaying daily task status

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
        // Ensure message.data is treated as PlannedTask for rich display
        if (message.data && "taskName" in message.data && "dailyTasks" in message.data) {
          const planData = message.data as PlannedTask; 
          return (
            <div>
              <h4 className="font-semibold mb-1">Task Plan Generated: {planData.taskName}</h4>
              {planData.overallReminder && <p className="text-sm italic mb-2">Reminder: {planData.overallReminder}</p>}
              <p className="text-sm mb-1">Overall Status: <Badge variant={planData.status === 'completed' ? 'outline' : planData.status === 'inprogress' ? 'default' : 'secondary'} className="capitalize text-xs">{planData.status || "Todo"}</Badge></p>
              
              <h5 className="font-medium mt-2 mb-1 text-sm">Daily Breakdown:</h5>
              {planData.dailyTasks && planData.dailyTasks.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {planData.dailyTasks.map((dailyTask, index) => (
                    <AccordionItem value={`chat-day-${message.id}-${dailyTask.id || index}`} key={dailyTask.id || index} className="border-b-muted/50">
                      <AccordionTrigger className="text-xs font-medium hover:no-underline py-1.5 px-1 text-left">
                        <div className="flex justify-between items-center w-full">
                           <span>{dailyTask.dayDescription}</span>
                           <Badge variant={dailyTask.status === 'completed' ? 'outline' : dailyTask.status === 'inprogress' ? 'default' : 'secondary'} size="sm" className="capitalize text-xs ml-2">{dailyTask.status || "Todo"}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-3 pt-1 pb-1 text-xs">
                        {dailyTask.subTasks && dailyTask.subTasks.length > 0 ? (
                          <ul className="list-none space-y-0.5">
                            {dailyTask.subTasks.map((subTask, subIndex) => (
                              <li key={subTask.id || subIndex} className="flex items-start">
                                {subTask.status === "completed" ? <CheckCircle className="mr-1.5 mt-0.5 h-3 w-3 text-green-400 shrink-0" /> : <Circle className="mr-1.5 mt-0.5 h-3 w-3 text-muted-foreground shrink-0" />}
                                <span className={cn(subTask.status === "completed" && "line-through text-muted-foreground")}>{subTask.description}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No sub-tasks for this day.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-xs text-muted-foreground">No daily steps provided.</p>
              )}
               <p className="text-xs mt-2 text-muted-foreground">You can view and manage this task in detail on the "AI Task Management" page.</p>
            </div>
          );
        }
        // Fallback for plan type if data structure is not as expected
        return <p>{message.content} (Plan details might be missing or in old format)</p>; 
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
          {format(new Date(message.timestamp), "PPpp")}
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
