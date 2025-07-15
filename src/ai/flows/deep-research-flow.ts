
'use server';
/**
 * @fileOverview An AI flow for conducting deep research on a given topic.
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

const DataPointSchema = z.object({
    point: z.string().describe("The name of the data point or statistic (e.g., 'Market Size 2023')."),
    value: z.string().describe("The value of the data point (e.g., '$1.2 Trillion')."),
    context: z.string().optional().describe("A brief context for the data point.")
});

const DeepResearchOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the research topic, incorporating the focus points.'),
  sources: z.array(SourceSchema).describe('A list of plausible sources the AI might have used to generate the summary. These are for reference and may not be real.'),
  dataPoints: z.array(DataPointSchema).describe('A list of key statistics, figures, or important data points found during the research.'),
});
export type DeepResearchOutput = z.infer<typeof DeepResearchOutputSchema>;

export async function deepResearch(input: DeepResearchInput): Promise<DeepResearchOutput> {
  return deepResearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'deepResearchPrompt',
  input: {schema: DeepResearchInputSchema},
  output: {schema: DeepResearchOutputSchema},
  prompt: `You are a highly skilled research assistant. Your task is to conduct in-depth research on a given topic and provide a structured report.

Research Topic:
{{{topic}}}

{{#if focusPoints}}
Key Focus Points:
{{{focusPoints}}}
Please ensure your research and summary specifically address these points.
{{/if}}

Based on your knowledge, please perform the following actions:
1.  **Generate a comprehensive Summary:** Write a detailed summary of the topic. If focus points are provided, make sure your summary covers them thoroughly.
2.  **Extract Key Data Points:** Identify and list critical statistics, figures, or quantifiable data related to the topic. For each data point, provide a 'point' (the metric name), a 'value', and optional 'context'.
3.  **List Plausible Sources:** Provide a list of credible, plausible sources that would typically cover this topic. For each source, include a title, a full URL, and the publication name. These sources should appear realistic and relevant, even if you are generating them from your internal knowledge.

Structure your entire response as a single, valid JSON object that strictly conforms to the provided output schema.
The goal is to deliver a well-researched, easy-to-digest report that a user can use for further work.
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
