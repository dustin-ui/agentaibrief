import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    let stripeCustomerId: string | null = null;

    // Look up by userId first, then fall back to email
    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();
      stripeCustomerId = profile?.stripe_customer_id ?? null;
    }

    if (!stripeCustomerId && email) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('stripe_customer_id')
        .eq('email', email.toLowerCase())
        .single();
      stripeCustomerId = profile?.stripe_customer_id ?? null;
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found for this account. If you believe this is an error, email dustin@foxhomesteam.com' },
        { status: 404 }
      );
    }

    const origin = request.headers.get('origin') || 'https://agentaibrief.com';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/manage-subscription?returned=true`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
