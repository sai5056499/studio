import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({
    apiKey: 'AIzaSyD5ewTA6aWiBUgmZaGOKnb8jUBHHWCbTNI'
  })],
  model: 'googleai/gemini-2.0-flash',
});
