'use server';

/**
 * @fileOverview Generates similar stories based on a given story using generative AI.
 *
 * - generateSimilarStories - A function that generates similar stories.
 * - GenerateSimilarStoriesInput - The input type for the generateSimilarStories function.
 * - GenerateSimilarStoriesOutput - The return type for the generateSimilarStories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSimilarStoriesInputSchema = z.object({
  storyText: z.string().describe('The text of the story to generate similar stories from.'),
  numStories: z.number().default(1).describe('The number of similar stories to generate.'),
});
export type GenerateSimilarStoriesInput = z.infer<typeof GenerateSimilarStoriesInputSchema>;

const GenerateSimilarStoriesOutputSchema = z.object({
  stories: z.array(z.string()).describe('An array of similar stories.'),
});
export type GenerateSimilarStoriesOutput = z.infer<typeof GenerateSimilarStoriesOutputSchema>;

export async function generateSimilarStories(
  input: GenerateSimilarStoriesInput
): Promise<GenerateSimilarStoriesOutput> {
  return generateSimilarStoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSimilarStoriesPrompt',
  input: {schema: GenerateSimilarStoriesInputSchema},
  output: {schema: GenerateSimilarStoriesOutputSchema},
  prompt: `You are a creative story writer. Please generate {{{numStories}}} similar stories based on the following story. Each story should be engaging.

Your final output must be a JSON object with a "stories" array, where each element is one of the generated stories.

Original Story:
{{{storyText}}}
`,
});

const generateSimilarStoriesFlow = ai.defineFlow(
  {
    name: 'generateSimilarStoriesFlow',
    inputSchema: GenerateSimilarStoriesInputSchema,
    outputSchema: GenerateSimilarStoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
