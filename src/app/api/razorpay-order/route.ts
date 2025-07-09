import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { plans } from '@/lib/plans';
import { z } from 'zod';
import { adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const OrderPayloadSchema = z.object({
  planId: z.enum(['plan_creator', 'plan_pro']),
  userId: z.string().min(1, { message: 'User ID is required.' }),
});

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('Razorpay keys not found in environment variables.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }
  
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    const body = await request.json();
    const validation = OrderPayloadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: `Invalid payload.`, details: validation.error.errors }, { status: 400 });
    }

    const { planId, userId } = validation.data;
    
    if (decodedToken.uid !== userId) {
        return NextResponse.json({ error: 'User ID mismatch.' }, { status: 403 });
    }

    const selectedPlan = plans.find(p => p.id === planId);

    if (!selectedPlan) {
      return NextResponse.json({ error: 'Plan not found.' }, { status: 404 });
    }
    
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    
    const options = {
      amount: selectedPlan.price * 100, // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${new Date().getTime()}`,
      notes: {
        userId: userId,
        planId: planId,
      }
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({ ...order, keyId: keyId });

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
