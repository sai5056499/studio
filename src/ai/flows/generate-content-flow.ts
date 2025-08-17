
'use server';
/**
 * @fileOverview An AI flow for generating various types of written content.
 *
 * - generateContent - A function that handles the content generation process.
 * - GenerateContentInput - The input type for the generateContent function.
 * - GenerateContentOutput - The return type for the generateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty.").describe('The main topic or instruction for the content generation.'),
  contentType: z.enum(["blog_post", "email", "social_media_post", "poem", "short_story", "generic"])
    .default("generic")
    .describe('The type of content to generate (e.g., "blog_post", "email").'),
  tone: z.enum(["formal", "casual", "humorous", "professional", "creative"])
    .default("professional")
    .describe('The desired tone of the generated content (e.g., "formal", "casual").'),
  maxLength: z.number().int().positive().optional().describe('Optional maximum length for the content (e.g., in words or characters, interpret loosely).'),
  customInstructions: z.string().optional().describe('Any additional specific instructions for the AI (e.g., target audience, key points to include).'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

const GenerateContentOutputSchema = z.object({
  generatedContent: z.string().describe('The AI-generated content based on the provided input.'),
  warnings: z.array(z.string()).optional().describe('Optional warnings, e.g., if content was truncated or instructions were hard to follow.'),
});
export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;

export async function generateContent(input: GenerateContentInput): Promise<GenerateContentOutput> {
  return generateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContentPrompt',
  input: {schema: GenerateContentInputSchema},
  output: {schema: GenerateContentOutputSchema},
  prompt: `You are an AI content generation assistant. Your task is to generate content based on the user's specifications.

User's Main Prompt/Topic:
{{{prompt}}}

Content Type to Generate: {{contentType}}
Desired Tone: {{tone}}

{{#if maxLength}}
Target Maximum Length: Approximately {{maxLength}} (words/characters - interpret this as a guideline, not a strict limit). Try to be concise if a length is specified.
{{/if}}

{{#if customInstructions}}
Additional Custom Instructions:
{{{customInstructions}}}
{{/if}}

Please generate the content as requested.
If you encounter any issues or limitations (e.g., if the request is too complex to fully satisfy within a reasonable length, or if a requested length is too short for the topic), include a brief warning in the 'warnings' array. Otherwise, the 'warnings' array can be empty or omitted.
Ensure your output strictly conforms to the JSON output schema.
Focus on fulfilling the 'prompt' and adhering to the 'contentType', 'tone', and any 'customInstructions'.
The 'generatedContent' field should contain only the creative text.
`,
});

const generateContentFlow = ai.defineFlow(
  {
    name: 'generateContentFlow',
    inputSchema: GenerateContentInputSchema,
    outputSchema: GenerateContentOutputSchema,
  },
  async (input: GenerateContentInput) => {
    const {output} = await prompt(input);
    if (!output) {
        return { generatedContent: "I apologize, but I encountered an issue generating content or the model did not return a valid response.", warnings: ["Model output was empty or invalid."] };
    }
    return output;
  }
);
