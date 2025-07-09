"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import type { Story } from '@/types';
import StoryCard from '@/components/story-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Home } from 'lucide-react';
import StoryGenerator from '@/components/story-generator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ageGroups = ['All', '3-5', '6-8', '9-12'];
const themes = ['All', 'Adventure', 'Fantasy', 'Friendship', 'Science'];
const readingLevels = ['All', 'Easy', 'Intermediate', 'Advanced'];

export default function StoriesView() {
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [ageGroupFilter, setAgeGroupFilter] = useState('All');
  const [themeFilter, setThemeFilter] = useState('All');
  const [readingLevelFilter, setReadingLevelFilter] = useState('All');

  const router = useRouter();
  const { user, loading, logOut } = useAuth();
  const { toast } = useToast();
  const [storiesLoading, setStoriesLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (user && db) {
      setStoriesLoading(true);
      const storiesRef = collection(db, "stories");
      const q = query(storiesRef, where("userId", "==", user.uid));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const stories: Story[] = [];
        querySnapshot.forEach((doc) => {
          stories.push({ id: doc.id, ...doc.data() } as Story);
        });

        // Sort stories by creation date on the client-side
        stories.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });

        setUserStories(stories);
        setStoriesLoading(false);
      }, (error) => {
        console.error("Failed to fetch user stories:", error);
        toast({
          variant: "destructive",
          title: "Error fetching stories",
          description: "Could not load your saved stories.",
        });
        setStoriesLoading(false);
      });

      return () => unsubscribe(); // Cleanup listener on unmount
    } else if (!loading) {
        // No user, stop loading. The other useEffect handles the redirect.
        setStoriesLoading(false);
    }
  }, [user, loading, toast]);

  useEffect(() => {
    handleFilterChange(ageGroupFilter, themeFilter, readingLevelFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userStories, ageGroupFilter, themeFilter, readingLevelFilter]);

  const handleFilterChange = (age: string, theme: string, level: string) => {
    let newFilteredStories = [...userStories];

    if (age !== 'All') {
      newFilteredStories = newFilteredStories.filter(story => story.ageGroup === age);
    }
    if (theme !== 'All') {
      newFilteredStories = newFilteredStories.filter(story => story.theme === theme);
    }
    if (level !== 'All') {
      newFilteredStories = newFilteredStories.filter(story => story.readingLevel === level);
    }
    
    setAgeGroupFilter(age);
    setThemeFilter(theme);
    setReadingLevelFilter(level);
    setFilteredStories(newFilteredStories);
  };
  
  if (loading || !user) {
    return (
        <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-12">
                <Skeleton className="h-16 w-64 mx-auto" />
                <Skeleton className="h-6 w-96 mx-auto mt-4" />
                <Skeleton className="h-12 w-48 mx-auto mt-6" />
            </header>
            <div className="mb-8 p-4 bg-card rounded-xl border shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
             </div>
        </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
          <div className="relative flex justify-center items-center text-center">
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
                <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                </Link>
                </Button>
                <Button asChild variant="ghost" size="icon" className="sm:hidden">
                <Link href="/">
                    <Home className="h-5 w-5" />
                </Link>
                </Button>
            </div>
            
            <div className=''>
                <h1 className="text-4xl sm:text-5xl font-bold font-headline flex items-center justify-center gap-2 sm:gap-4">
                <Image src="https://res.cloudinary.com/dsukslmgr/image/upload/v1752064727/ChatGPT_Image_Jul_9_2025_12_14_27_PM_l3fkk1.png" alt="SalistleAI Logo" width={48} height={48} className="w-8 h-8 sm:w-12 sm:h-12" />
                SalistleAI
                </h1>
                <p className="text-muted-foreground mt-2 text-base sm:text-lg">Your portal to magical stories and adventures.</p>
            </div>
            
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                        <AvatarFallback>
                            {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">My Account</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
        <div className="mt-6">
          <StoryGenerator />
        </div>
      </header>

      <div className="mb-8 p-4 bg-card rounded-xl border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Age Group</label>
            <Select value={ageGroupFilter} onValueChange={(val) => handleFilterChange(val, themeFilter, readingLevelFilter)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by age..." />
              </SelectTrigger>
              <SelectContent>
                {ageGroups.map(age => <SelectItem key={age} value={age}>{age}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Theme</label>
            <Select value={themeFilter} onValueChange={(val) => handleFilterChange(ageGroupFilter, val, readingLevelFilter)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by theme..." />
              </SelectTrigger>
              <SelectContent>
                {themes.map(theme => <SelectItem key={theme} value={theme}>{theme}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Reading Level</label>
            <Select value={readingLevelFilter} onValueChange={(val) => handleFilterChange(ageGroupFilter, themeFilter, val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by level..." />
              </SelectTrigger>
              <SelectContent>
                {readingLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {storiesLoading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
         </div>
      ) : filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredStories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <p className="text-muted-foreground text-xl">You haven't created any stories yet. <br/> Try generating one!</p>
        </div>
      )}
    </main>
  );
}
