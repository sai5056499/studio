
// src/ai/flows/ai-powered-task-planning.ts
'use server';

/**
 * @fileOverview AI-powered task planning flow.
 *
 * - aiPoweredTaskPlanning - A function that handles the task planning process.
 * - AiPoweredTaskPlanningInput - The input type for the aiPoweredTaskPlanning function.
 * - AiPoweredTaskPlanningOutput - The return type for the aiPoweredTaskPlanning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredTaskPlanningInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('A description of the task to be planned.'),
  deadline: z.string().describe('The deadline for the task.'),
});

export type AiPoweredTaskPlanningInput = z.infer<typeof AiPoweredTaskPlanningInputSchema>;

const SubTaskSchema = z.object({
  id: z.string().describe("A unique identifier for the sub-task (e.g., generated from a timestamp or a random string)."),
  description: z.string().describe("A specific, actionable sub-task to be completed."),
  status: z.enum(["todo", "inprogress", "completed"]).optional().describe('The current status of the sub-task (optional, will default to "todo" on client-side).')
});

const DailyTaskSchema = z.object({
  id: z.string().describe("A unique identifier for the daily task."),
  dayDescription: z.string().describe("Description or title for the day (e.g., 'Day 1: Research', 'Monday: Outline')."),
  subTasks: z.array(SubTaskSchema).describe("Specific sub-tasks (each with an ID, description, and status) to be completed on this day."),
  status: z.enum(["todo", "inprogress", "completed"]).optional().describe('The current status of the daily task (optional, will default to "todo" on client-side).')
});

const AiPoweredTaskPlanningOutputSchema = z.object({
  taskName: z.string().describe('The name of the overall task.'),
  dailyTasks: z.array(DailyTaskSchema).describe('A list of daily tasks, each with its own ID, description, status, and a list of sub-tasks (each sub-task having an ID, description, and status). This outlines the plan to meet the deadline.'),
  overallReminder: z.string().describe('A general reminder or motivational tip for the entire task project.'),
  status: z.enum(["todo", "inprogress", "completed"]).optional().describe('The current status of the overall task (optional, will default to "todo" on client-side).')
});

export type AiPoweredTaskPlanningOutput = z.infer<typeof AiPoweredTaskPlanningOutputSchema>;

export async function aiPoweredTaskPlanning(input: AiPoweredTaskPlanningInput): Promise<AiPoweredTaskPlanningOutput> {
  // Generate IDs for tasks here before sending to AI, or let client handle it fully.
  // For this version, we'll let the client assign IDs after receiving the AI plan,
  // but the schema requires IDs for the AI to know the structure.
  // The AI itself won't generate truly unique IDs, so client-side generation is more robust.
  // The prompt will ask the AI to fill in placeholder IDs like "subtask-1", "daily-1".
  return aiPoweredTaskPlanningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredTaskPlanningPrompt',
  input: {schema: AiPoweredTaskPlanningInputSchema},
  output: {schema: AiPoweredTaskPlanningOutputSchema},
  prompt: `You are a personal assistant helping the user plan a task.

  Task description: {{{taskDescription}}}
  Deadline: {{{deadline}}}

  Based on the task description and deadline, please provide a concise task name.
  Then, break down the main task into a schedule of daily tasks.
  For each daily task:
  - Provide a unique 'id' (e.g., "daily-1", "daily-2").
  - Provide a 'dayDescription' (e.g., "Day 1: Research & Information Gathering", "Tuesday: Draft initial sections").
  - List specific, actionable 'subTasks'. Each subTask must have:
    - A unique 'id' (e.g., "subtask-1.1", "subtask-1.2").
    - A 'description' of the sub-task.
    - Do NOT set the 'status' field for subTasks; it will be handled by the application.
  - Do NOT set the 'status' field for dailyTasks; it will be handled by the application.

  Finally, provide an 'overallReminder' or a motivational tip for the entire project.
  Do NOT set the 'status' field for the overall task; it will be handled by the application.
  Ensure your output is valid JSON that strictly conforms to the provided output schema.
  The goal is to create a clear, actionable daily plan with detailed sub-tasks to achieve the main task by its deadline.
  If the deadline is short (e.g. "today", "tomorrow"), the daily tasks might just be for one or two days.
  If the deadline is longer (e.g. "end of next week"), distribute tasks reasonably across the available days up to the deadline.
  Focus on creating 2-5 sub-tasks for each daily task.
  `,
});

const aiPoweredTaskPlanningFlow = ai.defineFlow(
  {
    name: 'aiPoweredTaskPlanningFlow',
    inputSchema: AiPoweredTaskPlanningInputSchema,
    outputSchema: AiPoweredTaskPlanningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Post-process to ensure unique IDs if needed, though client-side handling is preferred.
    return output!;
  }
);

