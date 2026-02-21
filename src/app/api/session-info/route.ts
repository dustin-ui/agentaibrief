import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

const PRICE_TO_TIER: Record<string, string> = {
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '']: 'pro',
  [process.env.STRIPE_PRO_ANNUAL_PRICE_ID || '']: 'pro',
  [process.env.STRIPE_IC_MONTHLY_PRICE_ID || '']: 'inner_circle',
  [process.env.STRIPE_IC_ANNUAL_PRICE_ID || '']: 'inner_circle',
};

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId) return NextResponse.json({ tier: null });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ tier: null });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });
    const priceId = session.line_items?.data[0]?.price?.id || '';
    const tier = PRICE_TO_TIER[priceId] || null;
    return NextResponse.json({ tier, email: session.customer_email });
  } catch {
    return NextResponse.json({ tier: null });
  }
}
