'use server';
/**
 * @fileOverview A flow for generating a story from a prompt.
 *
 * - generateStory - A function that handles generating a story.
 *
 * The input and output types for this flow, `GenerateStoryInput` and `GenerateStoryOutput`,
 * are defined in `src/types/index.ts`.
 */

import {ai} from '@/ai/genkit';
import { GenerateStoryInputSchema, GenerateStoryOutputSchema, type GenerateStoryInput, type GenerateStoryOutput } from '@/types';

export async function generateStory(input: GenerateStoryInput): Promise<GenerateStoryOutput> {
  return generateStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryPrompt',
  input: {schema: GenerateStoryInputSchema},
  output: {schema: GenerateStoryOutputSchema},
  prompt: `You are a creative children's story writer.
Generate a short story based on the following prompt.
The story should be appropriate for the age group: {{{ageGroup}}}.
The theme of the story should be: {{{theme}}}.
The story must be exactly {{{pageCount}}} pages long.

Prompt: {{{prompt}}}

Please provide a title for the whole story.
For each of the {{{pageCount}}} pages, please do the following:
1.  **Story Text**: Write 2-4 short sentences of engaging story text. This will be the "text" field for the page.
2.  **Illustration Prompt**: Write a concise, one-sentence description for a vivid and imaginative illustration that matches the story text. Focus on the main characters, action, and setting. This will be the "imagePrompt" field for the page.

The final output must be a JSON object with a "title" and a "pages" array. Each object in the "pages" array must have a "text" and an "imagePrompt" field.
Do not write any introductory text, just the JSON object.`,
});

const generateStoryFlow = ai.defineFlow(
  {
    name: 'generateStoryFlow',
    inputSchema: GenerateStoryInputSchema,
    outputSchema: GenerateStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
