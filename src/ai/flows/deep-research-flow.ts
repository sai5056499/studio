
'use server';
/**
 * @fileOverview An AI flow for conducting deep research on a given topic, inspired by Kimi-Research.
 * This flow uses an AI Tool to simulate web searches.
 *
 * - deepResearch - A function that handles the research process.
 * - DeepResearchInput - The input type for the deepResearch function.
 * - DeepResearchOutput - The return type for the deepResearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { DeepResearchOutputSchema, type Source } from '@/lib/types';
import { parseSources } from '@/services/parser-service';

// Define the input and output types for the main flow
const DeepResearchInputSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters.").describe('The main topic for the research.'),
  focusPoints: z.string().optional().describe('Specific areas or questions to focus on during the research.'),
});
export type DeepResearchInput = z.infer<typeof DeepResearchInputSchema>;
export type DeepResearchOutput = z.infer<typeof DeepResearchOutputSchema>;



// Define the AI Tool for web search simulation
const webSearchTool = ai.defineTool(
  {
    name: 'webSearch',
    description: 'Performs a web search for a given topic to find relevant articles and sources.',
    inputSchema: z.object({
      query: z.string().describe("The search query, which should be the research topic and any focus points."),
    }),
    outputSchema: z.object({
        sources: z.string().describe("A string containing up to 7 relevant sources found on the web, formatted as 'Title | URL | Publication' with each source on a new line. If no sources are found, this should be an empty string.")
    }),
  },
  async (input) => {
    // In a real application, this could be a call to a real search API (e.g., Google Search, Serper).
    // Here, we use another LLM call to *simulate* the search results.
    const searcher = await ai.generate({
      prompt: `You are a web search engine. Given the search query "${input.query}", find the 7 most relevant and up-to-date articles. For each, provide a realistic title, a plausible full URL, a publication name, and a concise, relevant snippet. Format the entire output as a single string, with each source on a new line, using '|' as a separator: "Title | URL | Publication". If you cannot find relevant sources, return an empty string.`,
      output: {
        schema: z.object({
            sources: z.string()
        })
      },
      // Use a different model if needed, or stick with the default
    });
    return searcher.output() || { sources: "" };
  }
);


// Define the main prompt that will use the web search tool
const researcherPrompt = ai.definePrompt({
    name: 'deepResearchPrompt',
    tools: [webSearchTool],
    input: { schema: DeepResearchInputSchema },
    output: { schema: z.object({
      summary: z.string().max(250).describe("A concise summary of key findings, under 250 words, synthesized *only* from the provided search results."),
      followUpQuestions: z.array(z.string()).describe("An array of insightful follow-up questions based on the research. Can be empty if no sources are found.")
    }) },
    prompt: `You are Kimi-Research, a helpful research assistant.
You have access to a web search tool.
Given the user's research topic, your process is:
1.  First, use the 'webSearch' tool with a query based on the topic and focus points to find relevant articles.
2.  Then, using *only the information from the search results provided by the tool*, synthesize a concise summary of the key findings (under 250 words).
3.  Finally, based on the synthesized summary, provide three insightful follow-up questions.

If the 'webSearch' tool returns no sources, your summary MUST be "No relevant sources were found." and the followUpQuestions array MUST be empty.
Do not use any information other than what the 'webSearch' tool returns.
Your entire response must be a single, valid JSON object and nothing else. Do not include any text before or after the JSON object.

User's Research Topic: {{{topic}}}
{{#if focusPoints}}
User's Key Focus Points: {{{focusPoints}}}
{{/if}}
`,
});

// The main exported flow
export async function deepResearch(input: DeepResearchInput): Promise<DeepResearchOutput> {
  // Call the researcher prompt, which will internally use the tool
  const result = await researcherPrompt(input);
  
  if (!result.output) {
    throw new Error("Research flow failed to produce a valid output.");
  }
  
  // The tool's output is available in the 'data' part of the response history
  const toolOutputs = result.history?.filter(m => m.role === 'tool') || [];
  
  let searchResults: Source[] = [];
  if (toolOutputs.length > 0 && toolOutputs[0].data && (toolOutputs[0].data as { sources: string }).sources) {
    const sourcesText = (toolOutputs[0].data as { sources: string }).sources;
    searchResults = await parseSources(sourcesText);
  }

  return {
    summary: result.output.summary,
    followUpQuestions: result.output.followUpQuestions as [string, string, string],
    sources: searchResults,
  };
}
