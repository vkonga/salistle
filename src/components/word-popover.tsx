"use client";

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getContextualDefinition } from '@/ai/flows/contextual-definitions';
import { Skeleton } from '@/components/ui/skeleton';

interface WordPopoverProps {
  word: string;
  context: string;
  children: React.ReactNode;
}

export default function WordPopover({ word, context, children }: WordPopoverProps) {
  const [definition, setDefinition] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && !definition) {
      setIsLoading(true);
      try {
        const result = await getContextualDefinition({ word, context });
        setDefinition(result.definition);
      } catch (error) {
        console.error("Failed to get definition:", error);
        setDefinition("Sorry, I couldn't get a definition for this word.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <span className="cursor-pointer hover:bg-primary/20 transition-colors rounded-md px-0.5 -mx-0.5">
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 shadow-xl">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none font-headline text-lg">{word}</h4>
            {isLoading ? (
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{definition}</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
