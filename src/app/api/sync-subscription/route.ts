import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PRICE_TO_TIER: Record<string, 'pro' | 'inner_circle'> = {
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'UNSET']: 'pro',
  [process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'UNSET']: 'pro',
  [process.env.STRIPE_IC_MONTHLY_PRICE_ID || 'UNSET']: 'inner_circle',
  [process.env.STRIPE_IC_ANNUAL_PRICE_ID || 'UNSET']: 'inner_circle',
};

/**
 * POST /api/sync-subscription
 * Called with { userId } after login — checks Stripe and corrects any stale tier in Supabase.
 * Safe to call repeatedly; only writes if a fix is needed.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ synced: false, reason: 'stripe_not_configured' });

    // Fetch user profile
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, stripe_customer_id, stripe_subscription_id, subscription_tier')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ synced: false, reason: 'profile_not_found' });
    }

    // Nothing to check if they have no Stripe customer ID and aren't on free tier
    if (!profile.stripe_customer_id && profile.subscription_tier !== 'free') {
      return NextResponse.json({ synced: false, reason: 'no_stripe_customer' });
    }

    let correctTier: 'pro' | 'inner_circle' | null = null;

    // Method 1: check their known subscription ID directly
    if (profile.stripe_subscription_id) {
      try {
        const sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
        if (sub.status === 'active' || sub.status === 'trialing') {
          const priceId = sub.items.data[0]?.price.id;
          correctTier = priceId ? (PRICE_TO_TIER[priceId] ?? null) : null;
        }
      } catch {
        // Subscription ID may be stale — fall through to customer lookup
      }
    }

    // Method 2: look up all subscriptions by customer ID
    if (!correctTier && profile.stripe_customer_id) {
      const subs = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'active',
        limit: 10,
      });

      for (const sub of subs.data) {
        const priceId = sub.items.data[0]?.price.id;
        const tier = priceId ? PRICE_TO_TIER[priceId] : null;
        if (tier) {
          correctTier = tier;
          // Update subscription ID while we're here
          await supabaseAdmin
            .from('profiles')
            .update({ stripe_subscription_id: sub.id })
            .eq('id', userId);
          break;
        }
      }

      // Also check trialing subscriptions
      if (!correctTier) {
        const trialSubs = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'trialing',
          limit: 10,
        });
        for (const sub of trialSubs.data) {
          const priceId = sub.items.data[0]?.price.id;
          const tier = priceId ? PRICE_TO_TIER[priceId] : null;
          if (tier) {
            correctTier = tier;
            break;
          }
        }
      }
    }

    // Method 3: search by email if no customer ID
    if (!correctTier && profile.email) {
      const customers = await stripe.customers.list({ email: profile.email, limit: 5 });
      for (const customer of customers.data) {
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          limit: 5,
        });
        for (const sub of subs.data) {
          const priceId = sub.items.data[0]?.price.id;
          const tier = priceId ? PRICE_TO_TIER[priceId] : null;
          if (tier) {
            correctTier = tier;
            // Save the customer ID we just discovered
            await supabaseAdmin
              .from('profiles')
              .update({ stripe_customer_id: customer.id, stripe_subscription_id: sub.id })
              .eq('id', userId);
            break;
          }
        }
        if (correctTier) break;
      }
    }

    // Fix if tier is wrong
    if (correctTier && correctTier !== profile.subscription_tier) {
      await supabaseAdmin
        .from('profiles')
        .update({
          subscription_tier: correctTier,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      console.log(`[sync-subscription] Fixed ${profile.email}: ${profile.subscription_tier} → ${correctTier}`);
      return NextResponse.json({ synced: true, from: profile.subscription_tier, to: correctTier });
    }

    return NextResponse.json({ synced: false, tier: profile.subscription_tier, reason: 'already_correct' });
  } catch (err) {
    console.error('[sync-subscription] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
