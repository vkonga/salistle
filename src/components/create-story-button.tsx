
"use client";

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, Gem } from 'lucide-react';

export default function CreateStoryButton() {
    const { user, loading, subscription } = useAuth();

    if (loading) {
        return (
            <Button size="lg" disabled>
                <Sparkles className="mr-2 h-5 w-5" />
                Loading...
            </Button>
        );
    }
    
    if (!user) {
        return (
            <Button asChild size="lg">
                <Link href="/signup">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Create Your First Story
                </Link>
            </Button>
        );
    }
    
    // For both subscribed and non-subscribed users, lead them to the stories page.
    // The story generator dialog will handle the subscription check.
    return (
        <Button asChild size="lg">
            <Link href="/stories">
                <Sparkles className="mr-2 h-5 w-5" />
                {subscription.status === 'subscribed' ? 'Create a Story' : 'Start Creating'}
            </Link>
        </Button>
    );
}
