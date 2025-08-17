'use server';

/**
 * @fileOverview An AI agent for improving the grammar, style, and clarity of webpage content.
 *
 * - improvePageContent - A function that handles the content improvement process.
 * - ImprovePageContentInput - The input type for the improvePageContent function.
 * - ImprovePageContentOutput - The return type for the improvePageContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImprovePageContentInputSchema = z.object({
  pageContent: z
    .string()
    .describe('The content of the current webpage to be improved.'),
});
export type ImprovePageContentInput = z.infer<typeof ImprovePageContentInputSchema>;

const ImprovePageContentOutputSchema = z.object({
  improvedContent: z
    .string()
    .describe('The improved content with better grammar, style, and clarity.'),
  explanation: z
    .string()
    .describe('Explanation of the changes and improvements made.'),
});
export type ImprovePageContentOutput = z.infer<typeof ImprovePageContentOutputSchema>;

export async function improvePageContent(input: ImprovePageContentInput): Promise<ImprovePageContentOutput> {
  return improvePageContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improvePageContentPrompt',
  input: {schema: ImprovePageContentInputSchema},
  output: {schema: ImprovePageContentOutputSchema},
  prompt: `You are an AI expert in improving webpage content.

You will receive the content of a webpage and provide suggestions for improving the grammar, style, and clarity.
Also provide an explanation of the changes and improvements made.

Page Content: {{{pageContent}}}`,
});

const improvePageContentFlow = ai.defineFlow(
  {
    name: 'improvePageContentFlow',
    inputSchema: ImprovePageContentInputSchema,
    outputSchema: ImprovePageContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
