import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PRICE_IDS } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;
    const user = auth.user;

    const stripe = getStripe();

    // Fail CLOSED: if Stripe is not configured we cannot verify entitlement.
    // Never grant a paid tier as a fallback.
    if (!stripe) {
      return NextResponse.json(
        { tier: 'guest', error: 'Access verification temporarily unavailable.' },
        { status: 503 }
      );
    }

    // Derive entitlement from the authenticated user's profile / Stripe customer.
    // Never trust an email from the request body.
    const { data: profile } = await supabaseAdmin()
      .from('profiles')
      .select('email, stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    const lookupEmail = (profile?.email || user.email || '').toLowerCase().trim();
    const stripeCustomerId = profile?.stripe_customer_id || null;

    // Resolve the Stripe customer for THIS authenticated user only.
    let customerId = stripeCustomerId;
    if (!customerId && lookupEmail) {
      const customers = await stripe.customers.list({ email: lookupEmail, limit: 1 });
      customerId = customers.data[0]?.id ?? null;
    }

    if (!customerId) {
      return NextResponse.json({ tier: 'guest', message: 'No subscription found' });
    }

    const activeSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 10,
    });
    const subs = [...activeSubs.data];
    if (subs.length === 0) {
      const trialSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'trialing',
        limit: 10,
      });
      subs.push(...trialSubs.data);
    }

    if (subs.length === 0) {
      return NextResponse.json({ tier: 'guest', message: 'No active subscription found' });
    }

    const innerCirclePriceIds = [
      PRICE_IDS.INNER_CIRCLE_MONTHLY,
      PRICE_IDS.INNER_CIRCLE_ANNUAL,
    ];
    const proPriceIds = [PRICE_IDS.PRO_MONTHLY, PRICE_IDS.PRO_ANNUAL];

    let tier = 'guest' as string;
    for (const sub of subs) {
      for (const item of sub.items.data) {
        const priceId = item.price.id;
        if (innerCirclePriceIds.includes(priceId)) {
          tier = 'inner-circle';
          break;
        }
        if (proPriceIds.includes(priceId) && tier !== 'inner-circle') {
          tier = 'pro';
        }
      }
      if (tier === 'inner-circle') break;
    }

    return NextResponse.json({
      tier,
      message:
        tier === 'guest'
          ? 'No matching subscription tier found'
          : `Active ${tier} subscription`,
    });
  } catch (error: unknown) {
    console.error('Verify access error:', error);
    return NextResponse.json(
      { error: 'Internal server error', tier: 'guest' },
      { status: 500 }
    );
  }
}
