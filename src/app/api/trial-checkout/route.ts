import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const { userId } = await request.json();
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ url: '/success?demo=true' });

  const origin = request.headers.get('origin') || 'https://agentaibrief.com';
  const priceId = process.env.STRIPE_IC_MONTHLY_PRICE_ID || 'price_ic_monthly';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 7 },
    payment_method_collection: 'always',
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&trial=true`,
    cancel_url: `${origin}/trial`,
    ...(userId ? { client_reference_id: userId } : {}),
  });

  return NextResponse.json({ url: session.url });
}
