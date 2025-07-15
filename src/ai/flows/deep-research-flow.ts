
'use server';
/**
 * @fileOverview An AI flow for conducting deep research on a given topic, inspired by Kimi-Research.
 *
 * - deepResearch - A function that handles the research process.
 * - DeepResearchInput - The input type for the deepResearch function.
 * - DeepResearchOutput - The return type for the deepResearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeepResearchInputSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters.").describe('The main topic for the research.'),
  focusPoints: z.string().optional().describe('Specific areas or questions to focus on during the research.'),
});
export type DeepResearchInput = z.infer<typeof DeepResearchInputSchema>;

const SourceSchema = z.object({
    title: z.string().describe("The title of the source article or document."),
    url: z.string().url().describe("The URL of the source. This should be a plausible, fully-formed URL."),
    publication: z.string().optional().describe("The name of the publication or website (e.g., 'Forbes', 'Wikipedia').")
});

const DeepResearchOutputSchema = z.object({
  summary: z.string().max(250, "Summary must be less than 250 words.").describe('A concise summary of the key findings, under 250 words.'),
  sources: z.array(SourceSchema).describe('A list of plausible sources the AI might have used to generate the summary. These are for reference and may not be real.'),
  followUpQuestions: z.array(z.string()).length(3).describe('An array of exactly three insightful follow-up questions based on the research.'),
});
export type DeepResearchOutput = z.infer<typeof DeepResearchOutputSchema>;

export async function deepResearch(input: DeepResearchInput): Promise<DeepResearchOutput> {
  return deepResearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'deepResearchPrompt',
  input: {schema: DeepResearchInputSchema},
  output: {schema: DeepResearchOutputSchema},
  prompt: `You are Kimi-Research, a helpful research assistant.
Given a topic, you MUST:
1. Search the web for the latest findings (and list these as plausible sources with URLs).
2. Summarize key points in ≤250 words.
3. End by generating exactly 3 insightful follow-up questions.

Research Topic:
"{{{topic}}}"

{{#if focusPoints}}
Key Focus Points:
{{{focusPoints}}}
Please ensure your research specifically addresses these points.
{{/if}}

Structure your entire response as a single, valid JSON object that strictly conforms to the provided output schema.
The summary should be concise and under 250 words. The 'followUpQuestions' field must contain exactly three string questions.
`,
});

const deepResearchFlow = ai.defineFlow(
  {
    name: 'deepResearchFlow',
    inputSchema: DeepResearchInputSchema,
    outputSchema: DeepResearchOutputSchema,
  },
  async (input: DeepResearchInput) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Research flow failed to produce an output.");
    }
    return output;
  }
);
