
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { NewStoryDataSchema, type NewStoryData } from '@/types';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';

/**
 * Saves a new story to Firestore after performing security checks and validation.
 * Story pages are stored in a subcollection for performance.
 * This is a Server Action and should only be called from the server.
 * @param storyData The story data to save.
 * @param userId The UID of the user performing the action. This MUST be the authenticated user.
 * @returns An object with either the new story ID or an error message.
 */
export async function saveStory(storyData: NewStoryData, userId: string): Promise<{ data: string | null; error: string | null; }> {
    try {
        if (!adminDb) {
            return { data: null, error: "Database service is not available." };
        }

        const validatedStoryData = NewStoryDataSchema.parse(storyData);

        if (validatedStoryData.userId !== userId) {
            return { data: null, error: "Authorization error: User ID mismatch." };
        }

        const { pages, ...mainStoryData } = validatedStoryData;

        // 1. Create the main story document (without pages)
        const storyRef = await adminDb.collection("stories").add({
            ...mainStoryData,
            createdAt: new Date()
        });

        // 2. Batch write all pages to a 'pages' subcollection
        const pagesCollectionRef = storyRef.collection('pages');
        const batch = adminDb.batch();

        pages.forEach(page => {
            const pageDocRef = pagesCollectionRef.doc(); // Firestore will auto-generate an ID
            batch.set(pageDocRef, page);
        });

        await batch.commit();

        revalidatePath('/stories');
        return { data: storyRef.id, error: null };

    } catch (error) {
        console.error("Error saving story:", error);
        if (error instanceof ZodError) {
            return { data: null, error: `Invalid story data provided: ${error.errors.map(e => e.message).join(', ')}` };
        }
        return { data: null, error: "An unexpected error occurred while saving the story." };
    }
}


/**
 * Deletes a story and its associated page subcollection from Firestore.
 * This is a Server Action and should only be called from the server.
 * @param storyId The ID of the story to delete.
 * @param userId The UID of the user performing the action. This MUST be the authenticated user.
 * @returns An object indicating success or failure with an error message.
 */
export async function deleteStory(storyId: string, userId: string): Promise<{ success: boolean; error: string | null; }> {
    try {
        if (!adminDb) {
            return { success: false, error: "Database service is not available." };
        }
    
        if (!storyId || !userId) {
            return { success: false, error: "Invalid input: storyId and userId are required." };
        }
        
        const storyRef = adminDb.collection('stories').doc(storyId);
        const storyDoc = await storyRef.get();

        if (!storyDoc.exists) {
            return { success: true, error: null }; // The story is already gone.
        }

        if (storyDoc.data()?.userId !== userId) {
            console.warn(`Unauthorized delete attempt: User ${userId} tried to delete story ${storyId}.`);
            return { success: false, error: "You are not authorized to delete this story." };
        }
        
        // Delete all documents in the 'pages' subcollection
        const pagesRef = storyRef.collection('pages');
        const pagesSnapshot = await pagesRef.get();
        if (!pagesSnapshot.empty) {
            const batch = adminDb.batch();
            pagesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }

        // Delete the main story document
        await storyRef.delete();

        revalidatePath('/stories');
        return { success: true, error: null };
        
    } catch (error) {
        console.error("Error deleting story:", error);
        return { success: false, error: "An unexpected error occurred while deleting the story." };
    }
}
