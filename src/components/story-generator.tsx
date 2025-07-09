
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateStory } from '@/ai/flows/generate-story';
import { saveStory } from '@/app/actions';
import { GenerateStoryInputSchema, type GenerateStoryOutput, type Story, type StoryPage, type NewStoryData } from '@/types';
import { Wand2, RefreshCw, Save, Loader2, ArrowRight, Gem } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { generateStoryImage } from '@/ai/flows/generate-story-image';
import Image from 'next/image';
import FlippingBook, { BookSheet } from './flipping-book';
import StoryDisplay from './story-display';
import { uploadImage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { plans } from '@/lib/plans';
import PricingCard from '@/components/pricing-card';


const ageGroups = ['3-5', '6-8', '9-12'];
const themes = ['Adventure', 'Fantasy', 'Friendship', 'Science', 'Mystery'];
const imageStyles = ["Children's Book Illustration", "Watercolor", "Cartoon", "Pixel Art", "Fantasy Art"];

const formSchema = GenerateStoryInputSchema.omit({ pageCount: true, userId: true }).extend({
    style: z.string().describe('The desired illustration style for the storybook images.'),
});

export default function StoryGenerator() {
  const { user, subscription, incrementStoryCount } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedStoryId, setSavedStoryId] = useState<string | null>(null);
  const [generatedStory, setGeneratedStory] = useState<GenerateStoryOutput | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, setValue, getValues } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      ageGroup: ageGroups[0],
      theme: themes[0],
      style: imageStyles[0],
    },
  });
  
  const generateInitialStory = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Authenticated",
            description: "You must be logged in to generate a story.",
        });
        return;
    }
    
    if (subscription.status !== 'subscribed' || subscription.storiesGeneratedThisMonth >= subscription.monthlyStoryLimit) {
        toast({
            variant: "destructive",
            title: "Subscription Required",
            description: "You have reached your story limit or need to subscribe.",
        });
        setIsOpen(false);
        return;
    }

    setIsLoading(true);
    setGeneratedStory(null);
    setImageUrls([]);
    setIsGeneratingImages(true);
    
    try {
      await incrementStoryCount();
      const storyResult = await generateStory({ ...values, pageCount: 12, userId: user.uid });
      setGeneratedStory(storyResult);
      
      const imagePageIndex = [0, 3, 6, 9];
      setImageUrls(Array(storyResult.pages.length).fill(null));

      const imagePromises = storyResult.pages.map((page, index) => {
          if (imagePageIndex.includes(index)) {
              return generateStoryImage({
                  prompt: page.imagePrompt,
                  theme: values.theme,
                  style: values.style,
              }).then(imageResult => {
                  setImageUrls(prevUrls => {
                      const updatedUrls = [...prevUrls];
                      updatedUrls[index] = imageResult.imageUrl;
                      return updatedUrls;
                  });
              }).catch(err => {
                  console.error(`Failed to generate image for page ${index}:`, err);
              });
          }
          return Promise.resolve();
      });

      await Promise.all(imagePromises);

    } catch (error: any) {
      console.error('Failed to generate story:', error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Story',
        description: error.message || 'There was a problem generating your story. Please try again.',
      });
      setGeneratedStory(null);
    } finally {
        setIsLoading(false);
        setIsGeneratingImages(false);
    }
  };


  const handleSave = async () => {
    if (!generatedStory || !user) return;
    
    const imagePageIndex = [0, 3, 6, 9];
    const requiredImages = imageUrls.filter((_, index) => imagePageIndex.includes(index));
    const allImagesGenerated = requiredImages.every(url => url !== null) && requiredImages.length === 4;

    if (!allImagesGenerated) {
        toast({
            variant: 'destructive',
            title: 'Illustrations Not Ready',
            description: 'Please wait for all 4 images to finish generating before saving.',
        });
        return;
    }
    
    setIsSaving(true);
    
    try {
        toast({
            title: 'Uploading Images...',
            description: 'Your illustrations are being saved securely to the cloud.',
        });
        
        const uploadPromises = imageUrls.map((url, index) => {
            if (imagePageIndex.includes(index) && url && url.startsWith('data:image')) {
                return uploadImage(url, user.uid);
            }
            return Promise.resolve(null);
        });

        const uploadedImageUrls = await Promise.all(uploadPromises);

        const coverImages = uploadedImageUrls.filter(url => url !== null) as string[];
        const coverImage = coverImages.length > 0 
            ? coverImages[Math.floor(Math.random() * coverImages.length)]
            : `https://placehold.co/600x400.png`;
        
        const pages: StoryPage[] = generatedStory.pages.map((page, index) => {
            const pageData: Partial<StoryPage> = {
                pageNumber: index,
                text: page.text ?? '',
                imagePrompt: page.imagePrompt ?? 'Illustration prompt not available',
            };
            const imageUrl = uploadedImageUrls[index];
            if (imageUrl) {
                pageData.imageUrl = imageUrl;
            }
            return pageData as StoryPage;
        });
        
        const storyData: NewStoryData = {
            title: generatedStory.title,
            pages: pages,
            ageGroup: getValues('ageGroup'),
            theme: getValues('theme'),
            author: user.email || 'AI Storyteller',
            coverImage: coverImage,
            userId: user.uid,
            readingLevel: "Intermediate",
        };

        const result = await saveStory(storyData, user.uid);

        if (result.error || !result.data) {
            throw new Error(result.error || "Failed to save story and retrieve ID.");
        }

        const newStoryId = result.data;
        setSaved(true);
        setSavedStoryId(newStoryId);

        toast({
            title: 'Story Saved!',
            description: 'Your new storybook is ready to be viewed.',
        });

    } catch (error: any) {
        console.error('Failed to save story:', error);
        toast({
            variant: 'destructive',
            title: 'Error Saving Story',
            description: error.message || 'There was a problem saving your story. Please try again.',
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setValue('prompt', '');
      setValue('ageGroup', ageGroups[0]);
      setValue('theme', themes[0]);
      setValue('style', imageStyles[0]);
      setGeneratedStory(null);
      setImageUrls([]);
      setIsLoading(false);
      setIsGeneratingImages(false);
      setSaved(false);
      setSavedStoryId(null);
    }
  };
  
  const handleGenerateAnother = () => {
      setValue('prompt', '');
      setGeneratedStory(null);
      setImageUrls([]);
      setIsGeneratingImages(false);
      setSaved(false);
      setSavedStoryId(null);
  }

  const handleTriggerClick = () => {
    setIsOpen(true);
  };
  
  const storiesLeft = subscription.monthlyStoryLimit - subscription.storiesGeneratedThisMonth;

  const renderContent = () => {
    if (isLoading || (generatedStory && isGeneratingImages)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[550px] text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-xl font-semibold">
            {isLoading ? 'Writing your story...' : 'Conjuring Illustrations...'}
          </h3>
          <p className="text-muted-foreground">
            {isLoading ? 'This can take a few moments.' : 'Please wait while our AI artists work their magic. This may take a minute.'}
          </p>
        </div>
      );
    }
    
    if (generatedStory) {
      const PageTemplate = ({ page, imageUrl, pageIndex }: { page?: { text: string }, imageUrl?: string | null, pageIndex: number }) => {
        if (!page) return <div className="p-4 md:p-6 bg-background h-full" />;

        const isDesignatedImagePage = [0, 3, 6, 9].includes(pageIndex);
        const hasImage = isDesignatedImagePage && !!imageUrl;

        return (
            <div className={cn(
                "p-4 md:p-6 h-full overflow-y-auto",
                hasImage ? "grid md:grid-cols-2 gap-8 items-center" : "flex flex-col justify-center"
            )}>
                {isDesignatedImagePage && (
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted" onContextMenu={(e) => e.preventDefault()}>
                        {imageUrl ? (
                            <Image src={imageUrl} alt="Illustration" layout="fill" objectFit="cover" className="pointer-events-none" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}
                    </div>
                )}
                <div className="h-full flex flex-col justify-center">
                    <StoryDisplay content={page.text} />
                </div>
            </div>
        );
      };
      
      const bookSheets = [];

      bookSheets.push(
        <BookSheet
          key="cover"
          front={
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-primary/10">
              <h2 className="text-3xl font-bold font-headline">{generatedStory.title}</h2>
            </div>
          }
          back={<PageTemplate page={generatedStory.pages[0]} imageUrl={imageUrls[0]} pageIndex={0} />}
        />
      );

      for (let i = 1; i < generatedStory.pages.length -1; i += 2) {
        bookSheets.push(
          <BookSheet
            key={i}
            front={<PageTemplate page={generatedStory.pages[i]} imageUrl={imageUrls[i]} pageIndex={i} />}
            back={<PageTemplate page={generatedStory.pages[i+1]} imageUrl={imageUrls[i+1]} pageIndex={i+1} />}
          />
        )
      }
      
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
        <>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold font-headline text-center">{generatedStory.title}</h3>
            <FlippingBook>
                {bookSheets}
            </FlippingBook>
          </div>
          <DialogFooter>
            {saved && savedStoryId ? (
                <>
                    <Button variant="outline" onClick={handleGenerateAnother}>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Create Another
                    </Button>
                    <Button asChild>
                        <Link href={`/story/${savedStoryId}`} onClick={() => setIsOpen(false)}>
                            View Book
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="outline" onClick={() => generateInitialStory(getValues())} disabled={isSaving || isLoading || isGeneratingImages}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || saved || isLoading || isGeneratingImages}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSaving ? 'Saving...' : (saved ? 'Saved!' : 'Save Storybook')}
                    </Button>
                </>
            )}
          </DialogFooter>
        </>
      );
    }
    
    if (subscription.status !== 'subscribed') {
        return (
            <div className="py-2">
                 <DialogHeader className="text-center mb-6">
                    <DialogTitle className="text-2xl font-headline">Upgrade to Create Stories</DialogTitle>
                    <DialogDescription>
                        You need an active subscription to generate stories. Please choose a plan to continue.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map(plan => (
                        <PricingCard key={plan.id} plan={plan} user={user!} />
                    ))}
                </div>
            </div>
        )
    }
    
    return (
      <form onSubmit={handleSubmit(generateInitialStory)} className="space-y-6">
        {storiesLeft > 0 ? (
            <Alert variant="default" className={cn(
                storiesLeft <= 3 && "bg-yellow-50 border-yellow-200 text-yellow-800"
            )}>
                <AlertTitle>{storiesLeft <= 3 ? "You're low on stories!" : "Story Generation Limit"}</AlertTitle>
                <AlertDescription>
                    You have <strong>{storiesLeft}</strong> of <strong>{subscription.monthlyStoryLimit}</strong> stories left this month.
                </AlertDescription>
            </Alert>
        ) : (
             <Alert variant="destructive">
                <AlertTitle>Story Limit Reached</AlertTitle>
                <AlertDescription>
                    You have used all your stories for this month. Your limit will reset next month.
                </AlertDescription>
            </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="prompt">Your story idea</Label>
          <Textarea
            id="prompt"
            placeholder="e.g., A brave knight who is afraid of spiders"
            className="resize-none"
            rows={4}
            {...register('prompt')}
            disabled={storiesLeft <= 0}
          />
          {errors.prompt && (
            <p className="text-sm font-medium text-destructive">{errors.prompt.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ageGroup">Age Group</Label>
            <Select onValueChange={(value) => setValue('ageGroup', value)} defaultValue={getValues('ageGroup')} disabled={storiesLeft <= 0}>
              <SelectTrigger id="ageGroup">
                <SelectValue placeholder="Select an age group" />
              </SelectTrigger>
              <SelectContent>
                {ageGroups.map(age => <SelectItem key={age} value={age}>{age}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select onValueChange={(value) => setValue('theme', value)} defaultValue={getValues('theme')} disabled={storiesLeft <= 0}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                {themes.map(theme => <SelectItem key={theme} value={theme}>{theme}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="style">Illustration Style</Label>
            <Select onValueChange={(value) => setValue('style', value)} defaultValue={getValues('style')} disabled={storiesLeft <= 0}>
              <SelectTrigger id="style">
                <SelectValue placeholder="Select an illustration style" />
              </SelectTrigger>
              <SelectContent>
                {imageStyles.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
            <Button type="submit" disabled={isLoading || isGeneratingImages || storiesLeft <= 0}>
              { (isLoading || isGeneratingImages) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" /> }
              { isLoading ? 'Writing...' : isGeneratingImages ? 'Illustrating...' : 'Generate Story' }
            </Button>
        </DialogFooter>
      </form>
    );
  }

  return (
    <>
      <Button size="lg" onClick={handleTriggerClick}>
        <Wand2 className="mr-2 h-5 w-5" />
        Generate a Story
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg md:max-w-3xl xl:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">Generate a New Story</DialogTitle>
          </DialogHeader>
          {user && renderContent()}
        </DialogContent>
      </Dialog>
    </>
  );
}
