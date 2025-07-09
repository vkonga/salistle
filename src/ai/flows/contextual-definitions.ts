'use server';

/**
 * @fileOverview A flow for providing AI-powered contextual definitions of difficult words.
 *
 * - getContextualDefinition - A function that handles the process of getting a contextual definition for a word.
 * - ContextualDefinitionInput - The input type for the getContextualDefinition function.
 * - ContextualDefinitionOutput - The return type for the getContextualDefinition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualDefinitionInputSchema = z.object({
  word: z.string().describe('The word to define.'),
  context: z.string().describe('The context in which the word is used.'),
});
export type ContextualDefinitionInput = z.infer<typeof ContextualDefinitionInputSchema>;

const ContextualDefinitionOutputSchema = z.object({
  definition: z.string().describe('The contextual definition of the word.'),
});
export type ContextualDefinitionOutput = z.infer<typeof ContextualDefinitionOutputSchema>;

export async function getContextualDefinition(input: ContextualDefinitionInput): Promise<ContextualDefinitionOutput> {
  return contextualDefinitionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualDefinitionPrompt',
  input: {schema: ContextualDefinitionInputSchema},
  output: {schema: ContextualDefinitionOutputSchema},
  prompt: `You are an expert lexicographer specializing in providing contextual definitions for young readers.

You will use the context provided to define the word in a way that is easy for a young reader to understand.
Your response MUST be a JSON object with a single key "definition".

Word: {{{word}}}
Context: {{{context}}}`,
});

const contextualDefinitionFlow = ai.defineFlow(
  {
    name: 'contextualDefinitionFlow',
    inputSchema: ContextualDefinitionInputSchema,
    outputSchema: ContextualDefinitionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
