
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
      sources: z.array(z.object({
        title: z.string().describe("The title of the article or webpage."),
        url: z.string().describe("The full URL of the source."),
        snippet: z.string().describe("A short, relevant snippet from the source."),
        publication: z.string().optional().describe("The name of the publishing website or organization.")
      })).describe("A list of up to 7 relevant sources found on the web.")
    }),
  },
  async (input) => {
    // In a real application, this could be a call to a real search API (e.g., Google Search, Serper).
    // Here, we use another LLM call to *simulate* the search results.
    const searcher = await ai.generate({
      prompt: `You are a web search engine. Given the search query "${input.query}", find the 7 most relevant and up-to-date articles. For each, provide a realistic title, a plausible full URL, a publication name, and a concise, relevant snippet.`,
      output: {
        schema: z.object({
          sources: z.array(z.object({
            title: z.string(),
            url: z.string(),
            snippet: z.string(),
            publication: z.string().optional()
          }))
        })
      },
      // Use a different model if needed, or stick with the default
    });
    return searcher.output() || { sources: [] };
  }
);


// Define the main prompt that will use the web search tool
const researcherPrompt = ai.definePrompt({
    name: 'deepResearchPrompt',
    tools: [webSearchTool],
    input: { schema: DeepResearchInputSchema },
    output: { schema: z.object({
      summary: z.string().max(250).describe("A concise summary of key findings, under 250 words, synthesized *only* from the provided search results."),
      followUpQuestions: z.array(z.string()).length(3).describe("An array of exactly three insightful follow-up questions based on the research.")
    }) },
    prompt: `You are Kimi-Research, a helpful research assistant.
You have access to a web search tool.
Given the user's research topic, your process is:
1.  First, use the 'webSearch' tool with a query based on the topic and focus points to find relevant articles.
2.  Then, using *only the information from the search results provided by the tool*, synthesize a concise summary of the key findings (under 250 words).
3.  Finally, based on the synthesized summary, provide exactly three insightful follow-up questions.

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
  const searchResults = toolOutputs.reduce((acc, curr) => {
    // Ensure curr.data and curr.data.sources exist before trying to spread them
    if (curr.data && (curr.data as any).sources) {
      const toolData = curr.data as { sources: Source[] };
      acc.push(...toolData.sources);
    }
    return acc;
  }, [] as Source[]);

  return {
    summary: result.output.summary,
    followUpQuestions: result.output.followUpQuestions as [string, string, string],
    sources: searchResults,
  };
}
