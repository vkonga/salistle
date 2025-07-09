
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // This webhook endpoint is not actively used for critical subscription updates in the current flow,
    // which relies on direct, client-side verification for a more immediate user experience.
    // It can be used for logging, analytics, or other secondary purposes if needed in the future.
    console.log("Razorpay webhook received an event, but it is not being processed for subscription status.");
    return NextResponse.json({ status: 'ok', message: 'Webhook received but not processed for subscription updates.' });
}
