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

const AiPoweredTaskPlanningOutputSchema = z.object({
  taskName: z.string().describe('The name of the task.'),
  steps: z.array(z.string()).describe('The steps to complete the task.'),
  reminder: z.string().describe('A reminder for the task.'),
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

  Based on the task description and deadline, please provide a task name, steps to complete the task, and a reminder for the task. Output must be valid JSON.`,
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
