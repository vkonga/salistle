
'use client';

import React, { useState, useEffect, Children } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

interface FlippingBookProps {
  children: React.ReactNode;
  className?: string;
}

export default function FlippingBook({ children, className }: FlippingBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const pages = Children.toArray(children);
  const totalBookPages = pages.length;

  const handleNextPage = () => {
    if (currentPage < totalBookPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getPageLabel = () => {
    if (currentPage === 0) return "Cover";
    
    if (currentPage === totalBookPages) return "Back Cover";

    const pageNum = (currentPage -1) * 2 + 1;
    const currentSheet = pages[currentPage] as React.ReactElement;
    
    if (currentSheet?.props && !currentSheet.props.back) {
        return `Page ${pageNum}`;
    }

    // Check if it's the last page sheet before the final back cover.
    if (currentPage === totalBookPages - 1) {
        return `Page ${pageNum}`;
    }

    return `Pages ${pageNum}-${pageNum+1}`;
  }

  if (!isClient) {
    return (
      <div className={cn("relative w-full max-w-md md:max-w-4xl mx-auto aspect-[1/1.3] sm:aspect-[2/1.1] p-4 flex items-center justify-center", className)}>
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full max-w-md md:max-w-4xl mx-auto aspect-[1/1.3] sm:aspect-[2/1.1] p-4", className)}>
      <div className="book-container">
        <div className="book">
          {pages.map((page, index) => {
            const isFlipped = index < currentPage;
            const zIndex = isFlipped ? index + 1 : totalBookPages - index;
            
            return (
              <div
                key={index}
                className={cn('page', { cover: index === 0 })}
                style={{
                  transform: `rotateY(${isFlipped ? -180 : 0}deg)`,
                  zIndex: zIndex,
                  left: '50%',
                }}
              >
                {page}
              </div>
            );
          })}
        </div>
      </div>
      
      <Button onClick={handlePrevPage} disabled={currentPage === 0} variant="outline" size="icon" className="absolute top-1/2 -translate-y-1/2 left-0 sm:-left-10 z-10 bg-background/50 hover:bg-background/80">
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button onClick={handleNextPage} disabled={currentPage >= totalBookPages} variant="outline" size="icon" className="absolute top-1/2 -translate-y-1/2 right-0 sm:-right-10 z-10 bg-background/50 hover:bg-background/80">
        <ChevronRight className="w-4 h-4" />
      </Button>

      <div className="absolute bottom-[-30px] sm:bottom-[-40px] left-1/2 -translate-x-1/2">
        <span className="text-sm text-muted-foreground w-28 text-center">{getPageLabel()}</span>
      </div>
    </div>
  );
}

export const BookSheet = ({ front, back }: { front: React.ReactNode; back?: React.ReactNode }) => {
  return (
    <>
      <div className="page-front">{front}</div>
      {back && <div className="page-back">{back}</div>}
    </>
  );
};
