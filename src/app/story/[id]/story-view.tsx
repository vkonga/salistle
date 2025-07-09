"use client";

import { useEffect, useState } from 'react';
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from '@/components/ui/card';
import StoryDisplay from '@/components/story-display';
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
                  <Skeleton className="aspect-[4/3] w-full rounded-xl mb-12" />
                  <Skeleton className="aspect-video w-full" />
              </article>
          </div>
      )
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button asChild variant="ghost">
            <Link href="/stories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stories
            </Link>
          </Button>
        </div>

        <article className="max-w-4xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-2">{story.title}</h1>
            <p className="text-lg text-muted-foreground">by {story.author}</p>
            <div className="flex gap-2 mt-4 justify-center">
                <Badge variant="secondary">Age {story.ageGroup}</Badge>
                <Badge variant="secondary">{story.theme}</Badge>
            </div>
          </header>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-4">Cover</h2>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl shadow-primary/20 bg-muted" onContextMenu={(e) => e.preventDefault()}>
                <Image
                    src={story.coverImage}
                    alt={`Cover for ${story.title}`}
                    layout="fill"
                    objectFit="cover"
                    priority
                    className="pointer-events-none"
                />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-4">Story Pages</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {(story.pages || []).map((page, index) => {
                const hasImage = !!page.imageUrl;

                return (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card className="overflow-hidden">
                        <CardContent className={cn(
                            "p-6 md:p-8 items-center min-h-[400px] md:min-h-[500px]",
                            hasImage ? "grid md:grid-cols-2 gap-8" : "flex flex-col justify-center"
                        )}>
                          {hasImage && (
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted" onContextMenu={(e) => e.preventDefault()}>
                              <Image
                                src={page.imageUrl!}
                                alt={page.imagePrompt}
                                layout="fill"
                                objectFit="cover"
                                className="bg-muted pointer-events-none"
                              />
                            </div>
                          )}
                          <div className="h-full flex flex-col justify-center">
                            <StoryDisplay content={page.text} />
                          </div>
                        </CardContent>
                        <div className="absolute bottom-4 right-4 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm px-2 py-1 rounded-md">
                          Page {index + 1}
                        </div>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2 md:-left-12 bg-background/50 hover:bg-background/80" />
            <CarouselNext className="right-2 md:-right-12 bg-background/50 hover:bg-background/80" />
          </Carousel>

          <footer className="mt-12 text-center">
            <SimilarStoriesGenerator storyText={story.pages.map(p => p.text).join('\n\n')} />
          </footer>
        </article>
      </div>
    </div>
  );
}
