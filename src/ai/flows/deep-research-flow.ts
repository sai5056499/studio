
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
import { parseSources } from '@/services/parser-service';

const DeepResearchInputSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters.").describe('The main topic for the research.'),
  focusPoints: z.string().optional().describe('Specific areas or questions to focus on during the research.'),
});
export type DeepResearchInput = z.infer<typeof DeepResearchInputSchema>;

const SourceSchema = z.object({
    title: z.string().describe("The title of the source article or document."),
    url: z.string().describe("The URL of the source. This should be a plausible, fully-formed URL."),
    publication: z.string().optional().describe("The name of the publication or website (e.g., 'Forbes', 'Wikipedia').")
});

export const DeepResearchOutputSchema = z.object({
  summary: z.string().max(250, "Summary must be less than 250 words.").describe('A concise summary of the key findings, under 250 words.'),
  sources: z.array(SourceSchema).describe('A list of plausible sources the AI might have used to generate the summary. These are for reference and may not be real.'),
  followUpQuestions: z.array(z.string()).length(3).describe('An array of exactly three insightful follow-up questions based on the research.'),
});
export type DeepResearchOutput = z.infer<typeof DeepResearchOutputSchema>;


const AiOutputSchema = z.object({
  summary: z.string().max(250, "Summary must be less than 250 words.").describe('A concise summary of the key findings, under 250 words.'),
  sourcesText: z.string().describe('A string listing the sources, with each source on a new line. Format each line as: "Title | URL | Publication"'),
  followUpQuestionsText: z.string().describe('A string listing exactly three insightful follow-up questions, separated by newlines.'),
});


export async function deepResearch(input: DeepResearchInput): Promise<DeepResearchOutput> {
  return deepResearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'deepResearchPrompt',
  input: {schema: DeepResearchInputSchema},
  output: {schema: AiOutputSchema},
  prompt: `You are Kimi-Research, a helpful research assistant.
Given a topic, you MUST:
1. Search the web for the latest findings.
2. For the 'sourcesText' field, list each source on a new line. Each line MUST follow this exact format: "Title of Article | https://www.example.com | Publication Name".
3. For the 'summary' field, summarize key points in ≤250 words.
4. For the 'followUpQuestionsText' field, provide exactly 3 insightful follow-up questions, each on a new line.

Research Topic:
"{{{topic}}}"

{{#if focusPoints}}
Key Focus Points:
{{{focusPoints}}}
Please ensure your research specifically addresses these points.
{{/if}}

IMPORTANT: Your entire response must be a single, valid JSON object that strictly and perfectly conforms to the provided output schema. Do not include any extra text, characters, or formatting outside of the JSON structure.
The summary should be concise and under 250 words.
`,
});

const deepResearchFlow = ai.defineFlow(
  {
    name: 'deepResearchFlow',
    inputSchema: DeepResearchInputSchema,
    outputSchema: DeepResearchOutputSchema,
  },
  async (input: DeepResearchInput): Promise<DeepResearchOutput> => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Research flow failed to produce an output.");
    }
    
    // Parse the semi-structured text into the final structured output
    const sources = await parseSources(output.sourcesText);
    const followUpQuestions = output.followUpQuestionsText.split('\n').map(q => q.trim()).filter(q => q);

    return {
      summary: output.summary,
      sources: sources,
      followUpQuestions: followUpQuestions.slice(0, 3) as [string, string, string],
    };
  }
);
