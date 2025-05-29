
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

const DailyTaskSchema = z.object({
  dayDescription: z.string().describe("Description or title for the day (e.g., 'Day 1: Research', 'Monday: Outline')."),
  subTasks: z.array(z.string()).describe("Specific sub-tasks to be completed on this day.")
});

const AiPoweredTaskPlanningOutputSchema = z.object({
  taskName: z.string().describe('The name of the overall task.'),
  dailyTasks: z.array(DailyTaskSchema).describe('A list of daily tasks, each with its own sub-tasks, outlining the plan to meet the deadline.'),
  overallReminder: z.string().describe('A general reminder or motivational tip for the entire task project.'),
  status: z.enum(["todo", "inprogress", "completed"]).optional().describe('The current status of the task (optional, will default to "todo" on client-side).')
});

export type AiPoweredTaskPlanningOutput = z.infer<typeof AiPoweredTaskPlanningOutputSchema>;

export async function aiPoweredTaskPlanning(input: AiPoweredTaskPlanningInput): Promise<AiPoweredTaskPlanningOutput> {
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
  Then, break down the main task into a schedule of daily tasks. For each day, provide a brief description for that day's focus or theme (e.g., "Day 1: Research & Information Gathering", "Tuesday: Draft initial sections") and then list specific, actionable sub-tasks to be completed for that day.
  Finally, provide an overall reminder or a motivational tip for the entire project.
  Do not set the 'status' field; it will be handled by the application.
  Ensure your output is valid JSON that strictly conforms to the provided output schema.
  The goal is to create a clear, actionable daily plan to achieve the task by its deadline.
  If the deadline is short (e.g. "today", "tomorrow"), the daily tasks might just be for one or two days.
  If the deadline is longer (e.g. "end of next week"), distribute tasks reasonably across the available days up to the deadline.
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
    return output!;
  }
);
