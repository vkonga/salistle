import { z } from 'zod';
import type { Timestamp } from 'firebase/firestore';

export interface Plan {
    id: 'plan_creator' | 'plan_pro';
    name: string;
    price: number;
    description: string;
    features: string[];
    monthlyStoryLimit: number;
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  imagePrompt: string; // The prompt used for generating the image
  imageUrl?: string;    // The URL of the generated image
}

export interface Story {
  id: string;
  title: string;
  author: string;
  coverImage: string; // Will be the imageUrl from one of the pages with an image
  pages?: StoryPage[];
  ageGroup: '3-5' | '6-8' | '9-12' | string;
  theme: 'Adventure' | 'Fantasy' | 'Friendship' | 'Science' | string;
  readingLevel: 'Easy' | 'Intermediate' | 'Advanced' | string;
  userId: string;
  createdAt?: Timestamp; // Can be a Firestore Timestamp
}

// A version of the Story type where Firestore Timestamps are serialized to strings
export type SerializedStory = Omit<Story, 'createdAt'> & {
    createdAt: string | null;
}

export const GenerateStoryInputSchema = z.object({
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters.' }).describe('The prompt to generate a story from.'),
  ageGroup: z.string().describe('The target age group for the story.'),
  theme: z.string().describe('The theme of the story.'),
  pageCount: z.number().min(4).max(12).default(12).describe('The number of pages in the storybook.'),
  userId: z.string().describe('The ID of the user generating the story.'),
});
export type GenerateStoryInput = z.infer<typeof GenerateStoryInputSchema>;

export const GenerateStoryOutputSchema = z.object({
  title: z.string().describe('The title of the generated story.'),
  pages: z.array(z.object({
    text: z.string().describe('The text content for this page of the story.'),
    imagePrompt: z.string().describe('A simple, concise prompt for an illustration that matches the page text.')
  })).describe('An array of pages representing the storybook.'),
});
export type GenerateStoryOutput = z.infer<typeof GenerateStoryOutputSchema>;

export const AuthCredentialSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});
export type AuthCredential = z.infer<typeof AuthCredentialSchema>;

// Schema for validating new story data on the server
export const NewStoryDataSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(150, 'Title is too long.'),
  author: z.string().trim().min(1).max(100),
  coverImage: z.string().url('Invalid cover image URL.'),
  pages: z.array(
    z.object({
      pageNumber: z.number().int(),
      text: z.string().trim().min(1).max(3000),
      imagePrompt: z.string().trim().min(1).max(1000),
      imageUrl: z.string().url().optional(),
    })
  ).min(1, 'A story must have at least one page.').max(12, 'A story can have at most 12 pages.'),
  ageGroup: z.string(),
  theme: z.string(),
  readingLevel: z.string(),
  userId: z.string(),
});
export type NewStoryData = z.infer<typeof NewStoryDataSchema>;
