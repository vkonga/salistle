
"use client";

import type { Plan } from '@/types';
import type { User } from 'firebase/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Gem, Loader2 } from 'lucide-react';
import useRazorpay from '@/hooks/use-razorpay';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';

interface PricingCardProps {
    plan: Plan;
    user: User | null;
}

export default function PricingCard({ plan, user }: PricingCardProps) {
    const { subscription } = useAuth();
    const { isPaying, handlePayment } = useRazorpay();
    const isCurrentPlan = user && subscription.status === 'subscribed' && subscription.planId === plan.name;
    const isProPlan = plan.id === 'plan_pro';
    
    return (
        <Card className={`flex flex-col rounded-xl border-2 ${isProPlan ? 'border-primary' : 'border-border'}`}>
            <CardHeader className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                        <CardDescription className="mt-2">{plan.description}</CardDescription>
                    </div>
                    {isProPlan && (
                    <div className="bg-primary text-primary-foreground text-xs font-bold uppercase px-2 py-1 rounded-full">
                        Best Value
                    </div>
                    )}
                </div>
                <div className="mt-6">
                    <span className="text-5xl font-extrabold">₹{plan.price}</span>
                    <span className="text-lg font-medium text-muted-foreground">/month</span>
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-6 pt-0">
                <ul className="space-y-4 text-muted-foreground">
                    {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary" />
                        <span>{feature}</span>
                    </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="p-6 pt-0">
                {user ? (
                     <Button
                        size="lg"
                        className="w-full"
                        disabled={isPaying || isCurrentPlan}
                        onClick={() => handlePayment(plan, user)}
                    >
                        {isPaying ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                        ) : isCurrentPlan ? (
                            'Current Plan'
                        ) : (
                            <><Gem className="mr-2 h-4 w-4" /> Subscribe</>
                        )}
                    </Button>
                ) : (
                    <Button asChild size="lg" className="w-full">
                        <Link href="/signup">Sign Up to Subscribe</Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
