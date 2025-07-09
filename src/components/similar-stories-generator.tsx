"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { generateSimilarStories } from '@/ai/flows/generate-similar-stories';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SimilarStoriesGeneratorProps {
  storyText: string;
}

export default function SimilarStoriesGenerator({ storyText }: SimilarStoriesGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stories, setStories] = useState<string[]>([]);

  const generateStories = async () => {
    setIsLoading(true);
    setStories([]);
    try {
      const result = await generateSimilarStories({ storyText, numStories: 2 });
      setStories(result.stories);
    } catch (error) {
      console.error('Failed to generate stories:', error);
      // You might want to show an error state to the user
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if(open) {
        generateStories();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Sparkles className="mr-2 h-5 w-5" />
          Generate Similar Stories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">AI Generated Stories</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] p-1">
          <div className="grid gap-6 pr-4">
            {isLoading && (
              <>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </>
            )}
            {!isLoading && stories.map((story, index) => (
              <div key={index} className="p-4 border rounded-lg bg-accent/50">
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{story}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
            <Button onClick={generateStories} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Generating...' : 'Generate Again'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
