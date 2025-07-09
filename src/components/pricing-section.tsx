
"use client";

import { useAuth } from '@/context/auth-context';
import { plans } from '@/lib/plans';
import PricingCard from './pricing-card';
import { Skeleton } from './ui/skeleton';

export default function PricingSection() {
    const { user, loading } = useAuth();

    return (
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-bold">Find a Plan That's Right For You</h3>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Start with a Creator plan or unlock more creative potential with our Pro plan.
                </p>
            </div>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Skeleton className="h-[450px] w-full" />
                    <Skeleton className="h-[450px] w-full" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
                    {plans.map(plan => (
                        <PricingCard key={plan.id} plan={plan} user={user} />
                    ))}
                </div>
            )}
        </div>
    );
}
