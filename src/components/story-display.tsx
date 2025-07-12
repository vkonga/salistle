"use client";

import WordPopover from './word-popover';

interface StoryDisplayProps {
  content: string;
}

export default function StoryDisplay({ content }: StoryDisplayProps) {
  // Use regex to split by spaces and punctuation, keeping the delimiters
  const segments = content.split(/([,."?!\s])/);

  return (
    <div className="text-[25px] text-white/90 leading-loose text-center">
      {segments.map((segment, index) => {
        const trimmedSegment = segment.trim();
        if (trimmedSegment.length === 0 || /[,."?!]/.test(trimmedSegment)) {
          return <span key={index}>{segment}</span>;
        }
        return (
          <WordPopover key={index} word={trimmedSegment} context={content}>
            {segment}
          </WordPopover>
        );
      })}
    </div>
  );
}
