// Summarize the content of the current webpage
'use server';
/**
 * @fileOverview Summarizes the content of a webpage.
 *
 * - summarizePageContent - A function that summarizes the content of a webpage.
 * - SummarizePageContentInput - The input type for the summarizePageContent function.
 * - SummarizePageContentOutput - The return type for the summarizePageContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePageContentInputSchema = z.object({
  pageContent: z.string().describe('The content of the webpage to summarize.'),
});
export type SummarizePageContentInput = z.infer<typeof SummarizePageContentInputSchema>;

const SummarizePageContentOutputSchema = z.object({
  summary: z.string().describe('A summary of the content of the webpage.'),
});
export type SummarizePageContentOutput = z.infer<typeof SummarizePageContentOutputSchema>;

export async function summarizePageContent(input: SummarizePageContentInput): Promise<SummarizePageContentOutput> {
  return summarizePageContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePageContentPrompt',
  input: {schema: SummarizePageContentInputSchema},
  output: {schema: SummarizePageContentOutputSchema},
  prompt: `Summarize the following content of a webpage:\n\n{{pageContent}}`,
});

const summarizePageContentFlow = ai.defineFlow(
  {
    name: 'summarizePageContentFlow',
    inputSchema: SummarizePageContentInputSchema,
    outputSchema: SummarizePageContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
