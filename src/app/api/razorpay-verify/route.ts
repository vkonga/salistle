
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { plans } from '@/lib/plans';
import { z } from 'zod';

const VerificationPayloadSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
  planId: z.enum(['plan_creator', 'plan_pro']),
});

export async function POST(request: Request) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
        console.error('Razorpay key secret not found in environment variables.');
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }
    
    if (!adminDb || !adminAuth) {
        console.error('Firebase Admin SDK not initialized.');
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    try {
        const authorization = request.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const body = await request.json();
        const validation = VerificationPayloadSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid payload provided.', details: validation.error.errors }, { status: 400 });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = validation.data;
        
        // Verify the signature
        const shasum = crypto.createHmac('sha256', keySecret);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpay_signature) {
            return NextResponse.json({ error: 'Transaction not legit!' }, { status: 400 });
        }

        // Signature is valid, now update the database
        const selectedPlan = plans.find(p => p.id === planId);
        if (!selectedPlan) {
            console.error(`Verification Error: Plan not found. The planId '${planId}' does not match any plan ID in your src/lib/plans.ts file.`);
            return NextResponse.json({ error: 'Plan not found in application configuration.' }, { status: 404 });
        }
        
        const userDocRef = adminDb.collection('users').doc(userId);
        
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30); // 30-day subscription

        const lastPaymentDate = new Date();

        const subscriptionData = {
            subscriptionStatus: 'subscribed',
            planId: selectedPlan.name,
            subscriptionEndDate: subscriptionEndDate,
            lastPaymentDate: lastPaymentDate,
            monthlyStoryLimit: selectedPlan.monthlyStoryLimit,
            storiesGeneratedThisMonth: 0, // Reset story count on new subscription/renewal
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
        };
        
        // Using set with merge: true will create the document if it doesn't exist or update it if it does.
        await userDocRef.set(subscriptionData, { merge: true });
        
        return NextResponse.json({ status: 'success', message: 'Subscription activated successfully.' });

    } catch (error: any) {
        console.error('Error processing Razorpay verification:', error);
         if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
          return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
