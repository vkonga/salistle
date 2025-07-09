import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a base64 encoded image to Firebase Storage.
 * @param base64 The base64 data URI of the image.
 * @param userId The ID of the user uploading the image.
 * @returns The public URL of the uploaded image.
 */
export async function uploadImage(base64: string, userId: string): Promise<string> {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized.");
  }
  
  // Extract content type and base64 data from data URI
  const match = base64.match(/^data:(image\/\w+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid base64 string format.");
  }
  
  const contentType = match[1];
  const base64Data = match[2];
  
  const imageRef = ref(storage, `stories/${userId}/${uuidv4()}`);
  
  try {
    const snapshot = await uploadString(imageRef, base64Data, 'base64', { contentType });
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image to Firebase Storage:", error);
    throw new Error("Could not upload image.");
  }
}
