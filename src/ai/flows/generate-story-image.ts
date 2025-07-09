'use server';
/**
 * @fileOverview A flow for generating a cover image for a story.
 * - generateStoryImage - A function that handles generating an image.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryImageInputSchema = z.object({
  prompt: z.string().describe('A simple, direct description of the scene to illustrate.'),
  theme: z.string().describe('The theme of the story, e.g., Fantasy, Adventure.'),
  style: z.string().describe('The desired illustration style, e.g., "children\'s book illustration".')
});
export type GenerateStoryImageInput = z.infer<typeof GenerateStoryImageInputSchema>;

// The output is just a data URI string for the image.
const GenerateStoryImageOutputSchema = z.object({
    imageUrl: z.string().describe("The data URI of the generated image. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateStoryImageOutput = z.infer<typeof GenerateStoryImageOutputSchema>;


export async function generateStoryImage(input: GenerateStoryImageInput): Promise<GenerateStoryImageOutput> {
  return generateStoryImageFlow(input);
}

const generateStoryImageFlow = ai.defineFlow(
  {
    name: 'generateStoryImageFlow',
    inputSchema: GenerateStoryImageInputSchema,
    outputSchema: GenerateStoryImageOutputSchema,
  },
  async ({ prompt, theme, style }) => {
    const fullPrompt = `A ${style} of ${prompt}. Theme: ${theme}.`;
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: fullPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
            },
        ]
      },
    });
    
    if (!media?.url) {
        throw new Error('Image generation failed to produce an image.');
    }

    return { imageUrl: media.url };
  }
);
