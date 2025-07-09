"use client";

import type { Story, SerializedStory } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from '@/components/ui/button';
import React, { useState } from 'react';
import { deleteStory } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

interface StoryCardProps {
  story: Story | SerializedStory;
}

export default function StoryCard({ story }: StoryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const themeColor = {
    Adventure: 'bg-green-100 text-green-800 border-green-200',
    Fantasy: 'bg-purple-100 text-purple-800 border-purple-200',
    Friendship: 'bg-pink-100 text-pink-800 border-pink-200',
    Science: 'bg-blue-100 text-blue-800 border-blue-200',
    Mystery: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  const handleDelete = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to delete a story.",
        });
        return;
    }

    setIsDeleting(true);
    
    const result = await deleteStory(story.id, user.uid);

    if (result.success) {
      toast({
        title: "Story Deleted",
        description: `"${story.title}" has been removed.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: result.error || "Could not delete the story. Please try again.",
      });
    }

    setIsDeleting(false);
    setIsAlertOpen(false);
  };
  
  const openDialog = (e: React.MouseEvent) => {
    e.preventDefault(); // This is important to stop the link navigation
    e.stopPropagation();
    setIsAlertOpen(true);
  }

  return (
    <div className="group relative h-full">
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-3 right-3 z-20 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={openDialog}
        disabled={isDeleting}
      >
        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        <span className="sr-only">Delete story</span>
      </Button>
      <Link href={`/story/${story.id}`} className="block h-full">
        <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1" onContextMenu={(e) => e.preventDefault()}>
          <CardHeader className="p-0 relative">
            <div className="aspect-[3/2] overflow-hidden">
              <Image
                src={story.coverImage}
                alt={`Cover art for ${story.title}`}
                width={600}
                height={400}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                data-ai-hint={`${story.theme?.toLowerCase() || 'story'} illustration`}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-4">
            <CardTitle className="text-xl font-headline mb-2 leading-tight">{story.title}</CardTitle>
            <p className="text-sm text-muted-foreground">by {story.author}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <div className="flex gap-2">
              {story.theme && <Badge variant="outline" className={cn(themeColor[story.theme as keyof typeof themeColor])}>{story.theme}</Badge>}
              <Badge variant="secondary">Age {story.ageGroup}</Badge>
            </div>
          </CardFooter>
        </Card>
      </Link>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              story titled "{story.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className={buttonVariants({ variant: "destructive" })}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
