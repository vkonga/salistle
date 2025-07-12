
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import type { Story, SerializedStory, StoryPage } from '@/types';
import StoryView from './story-view';

// The props for a Next.js page with dynamic segments
type PageProps = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

// Function to fetch story data on the server
async function getStory(id: string): Promise<Story | null> {
    if (!adminDb) return null;
    try {
        const storyRef = adminDb.collection('stories').doc(id);
        const storyDocSnap = await storyRef.get();

        if (!storyDocSnap.exists) {
            return null;
        }

        // Fetch pages from the subcollection
        const pagesRef = storyRef.collection('pages').orderBy('pageNumber');
        const pagesSnapshot = await pagesRef.get();
        const pages: StoryPage[] = pagesSnapshot.docs.map(doc => doc.data() as StoryPage);

        const storyData = storyDocSnap.data() as Omit<Story, 'id' | 'pages'>;

        // Combine main story data with pages
        return { 
            id: storyDocSnap.id, 
            ...storyData,
            pages: pages,
        };
    } catch (error) {
        console.error("Error fetching story from Firestore: ", error);
        return null; // Return null on error to be handled by the page component
    }
}

// Dynamic metadata generation
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const story = await getStory(params.id);

  if (!story || !story.pages || story.pages.length === 0) {
    return {
      title: 'Story Not Found',
    }
  }

  const description = story.pages[0]?.text.substring(0, 160).trim() + '...' || `An AI-generated story for children.`;

  return {
    title: story.title,
    description: description,
    openGraph: {
        title: `${story.title} | SalistleAI`,
        description: description,
        images: [
            {
                url: story.coverImage,
                width: 1200,
                height: 630,
                alt: `Cover art for ${story.title}`,
            },
        ],
        type: 'article',
        authors: [story.author],
    },
    twitter: {
        card: 'summary_large_image',
        title: `${story.title} | SalistleAI`,
        description: description,
        images: [story.coverImage],
    },
  }
}

// The page component itself (Server Component)
export default async function StoryPage({ params }: { params: { id: string } }) {
  const story = await getStory(params.id);
  
  if (!story) {
    notFound();
  }

  // Serialize the story object to make it safe to pass from Server to Client Component.
  // Both admin and client Timestamps have a `toDate()` method that returns a JS Date.
  const serializableStory: SerializedStory = {
      ...story,
      createdAt: story.createdAt?.toDate().toISOString() || null,
  };
  
  return <StoryView story={serializableStory} />;
}
