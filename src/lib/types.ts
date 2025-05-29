
import type { SummarizePageContentOutput } from "@/ai/flows/summarize-page-content";
import type { ImprovePageContentOutput } from "@/ai/flows/improve-page-content";
import type { AiPoweredTaskPlanningOutput } from "@/ai/flows/ai-powered-task-planning";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  type?: "summary" | "improvement" | "plan" | "text" | "error";
  data?: SummarizePageContentOutput | ImprovePageContentOutput | AiPoweredTaskPlanningOutput | { error: string };
}

export type TaskStatus = "todo" | "inprogress" | "completed";

export interface PlannedTask extends AiPoweredTaskPlanningOutput {
  id: string;
  originalDescription: string;
  deadline: string;
  createdAt: Date;
  isDailyReminderSet?: boolean;
  status: TaskStatus; // Now mandatory
}

export type PageContentSource = {
  content: string;
  sourceUrl?: string; // Optional: URL of the page if content is from a specific page
};
