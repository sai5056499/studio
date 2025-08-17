
'use server';
/**
 * @fileOverview An AI flow for answering questions based on provided document content.
 *
 * - chatWithPdf - A function that handles the Q&A process.
 * - ChatWithPdfInput - The input type for the chatWithPdf function.
 * - ChatWithPdfOutput - The return type for the chatWithPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithPdfInputSchema = z.object({
  documentContent: z.string().min(1, "Document content cannot be empty.").describe('The full text content of the PDF document.'),
  question: z.string().min(1, "Question cannot be empty.").describe('The user_s question about the document content.'),
});
export type ChatWithPdfInput = z.infer<typeof ChatWithPdfInputSchema>;

const ChatWithPdfOutputSchema = z.object({
  answer: z.string().describe('The AI_s answer to the question, based solely on the provided document content.'),
});
export type ChatWithPdfOutput = z.infer<typeof ChatWithPdfOutputSchema>;

export async function chatWithPdf(input: ChatWithPdfInput): Promise<ChatWithPdfOutput> {
  return chatWithPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithPdfPrompt',
  input: {schema: ChatWithPdfInputSchema},
  output: {schema: ChatWithPdfOutputSchema},
  prompt: `You are an AI assistant. Your task is to answer the user's question based *only* on the provided document content below.
Do not use any external knowledge or make assumptions beyond what is written in the document.
If the answer cannot be found within the document, clearly state that the information is not available in the provided text.

Document Content:
"""
{{{documentContent}}}
"""

User's Question:
"{{{question}}}"

Provide your answer in the 'answer' field.
Ensure your output strictly conforms to the JSON output schema.`,
});

const chatWithPdfFlow = ai.defineFlow(
  {
    name: 'chatWithPdfFlow',
    inputSchema: ChatWithPdfInputSchema,
    outputSchema: ChatWithPdfOutputSchema,
  },
  async (input: ChatWithPdfInput) => {
    const {output} = await prompt(input);
    if (!output) {
        // This case should ideally be handled by the model if it can't find an answer,
        // but as a fallback, we ensure the schema is met.
        return { answer: "I apologize, but I encountered an issue processing your request or the model did not return a valid answer." };
    }
    return output;
  }
);
