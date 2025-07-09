
'use client';

import { useState } from 'react';
import type { Plan } from '@/types';
import type { User } from 'firebase/auth';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';

const useRazorpay = () => {
  const [isPaying, setIsPaying] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan: Plan, user: User) => {
    setIsPaying(true);

    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      toast({
        variant: 'destructive',
        title: 'Payment Gateway Error',
        description: 'Could not load the Razorpay checkout script. Please check your connection.',
      });
      setIsPaying(false);
      return;
    }
    
    try {
        const token = await user.getIdToken();
        const orderResponse = await fetch('/api/razorpay-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                planId: plan.id,
                userId: user.uid,
            }),
        });

        if (!orderResponse.ok) {
            const errorData = await orderResponse.json();
            throw new Error(errorData.error || 'Failed to create payment order.');
        }

        const orderData = await orderResponse.json();
        
        const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'SalistleAI',
            description: `Subscription for ${plan.name} Plan`,
            image: 'https://res.cloudinary.com/dsukslmgr/image/upload/v1752064727/ChatGPT_Image_Jul_9_2025_12_14_27_PM_l3fkk1.png',
            order_id: orderData.id,
            handler: async (response: any) => {
                toast({
                    title: 'Verifying Payment...',
                    description: 'Please wait while we confirm your transaction.',
                });
                
                try {
                    const verificationResponse = await fetch('/api/razorpay-verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: plan.id, // Pass planId for context
                        }),
                    });

                    const verificationData = await verificationResponse.json();

                    if (!verificationResponse.ok || verificationData.error) {
                         throw new Error(verificationData.error || 'Payment verification failed.');
                    }
                    
                    toast({
                        title: 'Payment Successful!',
                        description: `Your subscription to the ${plan.name} plan is now active.`,
                    });
                    
                    // The onSnapshot listener in AuthContext will handle the UI update.
                    // Navigate to the stories page where the user can use their new subscription.
                    router.push('/stories');

                } catch (verifyError: any) {
                    toast({
                        variant: 'destructive',
                        title: 'Verification Failed',
                        description: verifyError.message || 'We could not verify your payment. Please contact support.',
                    });
                } finally {
                    setIsPaying(false);
                }
            },
            prefill: {
                name: user.displayName || '',
                email: user.email || '',
            },
            theme: {
                color: '#5D3FD3',
            },
            "modal": {
                "ondismiss": () => {
                    setIsPaying(false);
                }
            }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', (response: any) => {
            console.error(response);
            toast({
                variant: 'destructive',
                title: 'Payment Failed',
                description: response.error.description || 'Something went wrong.',
            });
            setIsPaying(false);
        });

        paymentObject.open();

    } catch (error: any) {
        console.error('Payment Error:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'An unexpected error occurred.',
        });
        setIsPaying(false);
    }
  };

  return { isPaying, handlePayment };
};

export default useRazorpay;
