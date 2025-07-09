
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Heart, Users, Check, Star } from 'lucide-react';
import Image from 'next/image';
import AuthNav from '@/components/auth-nav';
import CreateStoryButton from '@/components/create-story-button';
import HomePageImage from '@/components/home-page-image';
import type { Metadata } from 'next';
import { plans } from '@/lib/plans';
import PricingSection from '@/components/pricing-section';

export const metadata: Metadata = {
  title: 'AI Story Generator for Children',
  description: "Transform your ideas into beautifully illustrated children's books with SalistleAI, the AI-powered story creator. Perfect for parents, teachers, and young storytellers.",
};

export default async function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground/90 font-sans">
      <header className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
            <Image src="https://res.cloudinary.com/dsukslmgr/image/upload/v1752064727/ChatGPT_Image_Jul_9_2025_12_14_27_PM_l3fkk1.png" alt="SalistleAI Logo" width={32} height={32} className="h-8 w-8" />
            <h1 className="text-2xl font-bold">SalistleAI</h1>
        </Link>
        <AuthNav />
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Storytelling
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              Create <span className="text-primary">Magical</span> Stories for
              <br />
              Children
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Transform simple ideas into beautifully illustrated children's books using the
              power of AI. Perfect for parents, teachers, and young storytellers.
            </p>
            <div className="flex justify-center gap-4">
              <CreateStoryButton />
            </div>
            <div className="mt-12 md:mt-16 max-w-4xl mx-auto">
              <HomePageImage />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-card/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold">Why Choose SalistleAI?</h3>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Unleash creativity with AI-powered storytelling that brings imagination to life
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="text-center hover:shadow-xl transition-shadow p-6 rounded-xl border bg-card">
                  <div className="mx-auto bg-primary/10 p-4 rounded-xl w-fit mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold mb-2">AI-Powered Stories</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Advanced AI creates unique, engaging stories tailored to your themes and ideas.
                  </CardDescription>
              </Card>
              <Card className="text-center hover:shadow-xl transition-shadow p-6 rounded-xl border bg-card">
                  <div className="mx-auto bg-primary/10 p-4 rounded-xl w-fit mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold mb-2">Beautiful Illustrations</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Stunning, colorful artwork that captivates children and brings stories to life.
                  </CardDescription>
              </Card>
              <Card className="text-center hover:shadow-xl transition-shadow p-6 rounded-xl border bg-card">
                  <div className="mx-auto bg-primary/10 p-4 rounded-xl w-fit mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold mb-2">Family Friendly</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Safe, age-appropriate content designed specifically for children aged 5-12.
                  </CardDescription>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
            <PricingSection />
        </section>

      </main>

      <footer className="bg-card/50 border-t">
        <div className="container mx-auto px-6 py-8 text-center text-muted-foreground">
             <div className="flex items-center justify-center gap-2 mb-4">
                <Image src="https://res.cloudinary.com/dsukslmgr/image/upload/v1752064727/ChatGPT_Image_Jul_9_2025_12_14_27_PM_l3fkk1.png" alt="SalistleAI Logo" width={32} height={32} className="h-8 w-8" />
                <h1 className="text-xl font-bold">SalistleAI</h1>
            </div>
          <p className="mb-4">&copy; {new Date().getFullYear()} SalistleAI. Bringing stories to life with AI magic.</p>
          <div className="flex justify-center items-center gap-x-6 text-sm">
            <Link href="/contact" className="hover:text-primary transition-colors">
              Contact Us
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">
              Terms & Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
