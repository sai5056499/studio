'use server';
/**
 * @fileOverview An AI flow for extracting text from images (OCR).
 *
 * - extractTextFromImage - A function that handles the OCR process.
 * - ExtractTextFromImageInput - The input type for the extractTextFromImage function.
 * - ExtractTextFromImageOutput - The return type for the extractTextFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextFromImageInput = z.infer<typeof ExtractTextFromImageInputSchema>;

const ExtractTextFromImageOutputSchema = z.object({
  extractedText: z.string().describe('The text extracted from the image. Returns an empty string if no text is found or if the image is not suitable for OCR.'),
});
export type ExtractTextFromImageOutput = z.infer<typeof ExtractTextFromImageOutputSchema>;

export async function extractTextFromImage(input: ExtractTextFromImageInput): Promise<ExtractTextFromImageOutput> {
  return extractTextFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTextFromImagePrompt',
  input: {schema: ExtractTextFromImageInputSchema},
  output: {schema: ExtractTextFromImageOutputSchema},
  prompt: `You are an Optical Character Recognition (OCR) service.
Analyze the provided image and extract all visible text.
Present the extracted text as a single block of plain text.
Image: {{media url=imageDataUri}}
If no text is found, return an empty string in the 'extractedText' field.
Ensure your output strictly conforms to the output schema.`,
});

const extractTextFromImageFlow = ai.defineFlow(
  {
    name: 'extractTextFromImageFlow',
    inputSchema: ExtractTextFromImageInputSchema,
    outputSchema: ExtractTextFromImageOutputSchema,
  },
  async (input: ExtractTextFromImageInput) => {
    const {output} = await prompt(input);
    if (!output) {
        // Handle cases where the model might return nothing if no text is found,
        // ensuring we still conform to the schema.
        return { extractedText: "" };
    }
    return output;
  }
);
