import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { PRICE_IDS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', tier: 'guest' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // If Stripe is not configured, use demo mode
    if (!stripe) {
      // Demo mode: allow any email that looks real
      return NextResponse.json({
        tier: 'inner-circle',
        demo: true,
        message: 'Demo mode — Stripe not configured',
      });
    }

    // Look up customer by email in Stripe
    const customers = await stripe.customers.list({
      email: email.toLowerCase().trim(),
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({
        tier: 'guest',
        message: 'No subscription found for this email',
      });
    }

    const customer = customers.data[0];

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      // Also check trialing subscriptions
      const trialSubs = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'trialing',
        limit: 10,
      });

      if (trialSubs.data.length === 0) {
        return NextResponse.json({
          tier: 'guest',
          message: 'No active subscription found',
        });
      }

      subscriptions.data.push(...trialSubs.data);
    }

    // Determine highest tier from active subscriptions
    const innerCirclePriceIds = [
      PRICE_IDS.INNER_CIRCLE_MONTHLY,
      PRICE_IDS.INNER_CIRCLE_ANNUAL,
    ];
    const proPriceIds = [PRICE_IDS.PRO_MONTHLY, PRICE_IDS.PRO_ANNUAL];

    let tier = 'guest' as string;

    for (const sub of subscriptions.data) {
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
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message, tier: 'guest' },
      { status: 500 }
    );
  }
}
