
'use server';
/**
 * @fileOverview An AI flow for translating text between languages.
 *
 * - translateText - A function that handles the text translation process.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  textToTranslate: z.string().min(1, "Text to translate cannot be empty.").describe('The text content to be translated.'),
  targetLanguage: z.string().min(2, "Target language code must be specified.").describe('The target language for translation (e.g., "es" for Spanish, "fr" for French).'),
  sourceLanguage: z.string().optional().describe('The source language of the text (e.g., "en" for English). If not provided, the AI will attempt to auto-detect it.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text in the target language.'),
  detectedSourceLanguage: z.string().optional().describe('The detected source language code (e.g., "en") if auto-detection was used. This is the language code, not the full name.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

// Using the experimental model for potentially better translation, or stick to default.
// const model = experimental.googleAI.geminiPro; 

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `You are an expert multilingual translator.
Translate the following text into {{targetLanguage}}.

{{#if sourceLanguage}}
The source language is {{sourceLanguage}}.
{{else}}
You should auto-detect the source language. If you auto-detect the source language, include its ISO 639-1 code (e.g., "en", "es") in the 'detectedSourceLanguage' field of your response.
{{/if}}

Text to translate:
"""
{{{textToTranslate}}}
"""

Output the translated text in the 'translatedText' field.
If you auto-detected the source language, ensure the 'detectedSourceLanguage' field in your output contains the ISO 639-1 code for that language. Otherwise, leave 'detectedSourceLanguage' empty or undefined.
Your entire response must be valid JSON that strictly conforms to the output schema.
`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input: TranslateTextInput) => {
    // If sourceLanguage is "auto", remove it so the prompt triggers auto-detection logic
    const promptInput = {...input};
    if (input.sourceLanguage === "auto") {
      delete promptInput.sourceLanguage;
    }
    
    const {output} = await prompt(promptInput);
    if (!output) {
        throw new Error("Translation failed to produce an output.");
    }
    return output;
  }
);

    