
"use client";

import { useEffect } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SimilarStoriesGenerator from '@/components/similar-stories-generator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { SerializedStory } from '@/types';
import StoryDisplay from '@/components/story-display';
import FlippingBook, { BookSheet } from '@/components/flipping-book';
import { cn } from '@/lib/utils';

export default function StoryView({ story }: { story: SerializedStory }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  useEffect(() => {
    // Wait for authentication to resolve
    if (authLoading) return;
    
    // If not logged in, redirect
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Security check: If the logged-in user does not own the story, show not found.
    if (story.userId !== user.uid) {
        notFound();
    }
  }, [user, authLoading, router, story.userId]);


  if (authLoading || !user || story.userId !== user.uid) {
      return (
          <div className="container mx-auto px-4 py-8">
              <Skeleton className="h-10 w-48 mb-6" />
              <article className="max-w-4xl mx-auto">
                  <header className="mb-8 text-center">
                      <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
                      <Skeleton className="h-6 w-1/4 mx-auto mb-4" />
                      <div className="flex gap-2 mt-4 justify-center">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-24" />
                      </div>
                  </header>
                  <Skeleton className="aspect-video w-full" />
              </article>
          </div>
      )
  }

  const PageTemplate = ({ page, pageIndex }: { page?: { text: string; imagePrompt: string; imageUrl?: string; }, pageIndex: number }) => {
    if (!page) return <div className="p-4 md:p-6 bg-background h-full" />;

    const hasImage = !!page.imageUrl;

    return (
        <div className={cn(
            "p-4 md:p-8 h-full overflow-y-auto",
            hasImage ? "grid md:grid-cols-2 gap-8 items-center" : "flex flex-col justify-center"
        )}>
            {hasImage && (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted" onContextMenu={(e) => e.preventDefault()}>
                    <Image src={page.imageUrl!} alt={page.imagePrompt} layout="fill" objectFit="cover" className="pointer-events-none" />
                </div>
            )}
            <div className="h-full flex flex-col justify-center">
                <StoryDisplay content={page.text} />
            </div>
            <div className="absolute bottom-4 right-4 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm px-2 py-1 rounded-md">
              Page {pageIndex + 1}
            </div>
        </div>
    );
  };
  
  const bookSheets = [];
  const storyPages = story.pages || [];

  // Book Cover
  bookSheets.push(
    <BookSheet
      key="cover"
      front={
        <div className="w-full h-full relative" onContextMenu={(e) => e.preventDefault()}>
            <Image
                src={story.coverImage}
                alt={`Cover for ${story.title}`}
                layout="fill"
                objectFit="cover"
                priority
                className="pointer-events-none rounded-r-lg"
            />
        </div>
      }
      back={<PageTemplate page={storyPages[0]} pageIndex={0} />}
    />
  );

  // Book pages
  for (let i = 1; i < storyPages.length - 1; i += 2) {
    bookSheets.push(
      <BookSheet
        key={i}
        front={<PageTemplate page={storyPages[i]} pageIndex={i} />}
        back={<PageTemplate page={storyPages[i+1]} pageIndex={i+1} />}
      />
    )
  }
  
  // Last page if there is an odd number of pages inside the book
  if (storyPages.length > 1 && (storyPages.length - 1) % 2 !== 0) {
    const lastPageIndex = storyPages.length - 1;
     bookSheets.push(
        <BookSheet
            key={lastPageIndex}
            front={<PageTemplate page={storyPages[lastPageIndex]} pageIndex={lastPageIndex} />}
        />
    )
  }


  // Back cover
  bookSheets.push(
    <BookSheet
      key="back-cover"
      front={
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-background">
          <h2 className="text-3xl font-bold font-headline">The End</h2>
        </div>
      }
    />
  );


  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <div className="mb-6">
          <Button asChild variant="ghost">
            <Link href="/stories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stories
            </Link>
          </Button>
        </div>

        <article className="max-w-4xl mx-auto flex-grow flex flex-col justify-center w-full">
          <header className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-2">{story.title}</h1>
            <p className="text-lg text-muted-foreground">by {story.author}</p>
            <div className="flex gap-2 mt-4 justify-center">
                <Badge variant="secondary">Age {story.ageGroup}</Badge>
                <Badge variant="secondary">{story.theme}</Badge>
            </div>
          </header>

          <FlippingBook>
            {bookSheets}
          </FlippingBook>

          <footer className="mt-20 text-center">
            <SimilarStoriesGenerator storyText={story.pages.map(p => p.text).join('\n\n')} />
          </footer>
        </article>
      </div>
    </div>
  );
}
