import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabaseAdmin as getSupabaseAdmin } from '@/lib/supabase';
import { requireCronSecret, getAuthedUser, isAdminEmail } from '@/lib/api-auth';
import Stripe from 'stripe';

const supabaseAdmin = getSupabaseAdmin();

// Map Stripe price IDs to tiers (same as webhook)
const PRICE_TO_TIER: Record<string, 'pro' | 'inner_circle'> = {
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '']: 'pro',
  [process.env.STRIPE_PRO_ANNUAL_PRICE_ID || '']: 'pro',
  [process.env.STRIPE_IC_MONTHLY_PRICE_ID || '']: 'inner_circle',
  [process.env.STRIPE_IC_ANNUAL_PRICE_ID || '']: 'inner_circle',
};

// CC List IDs centralized in @/lib/config (CC_LISTS).

// Bounded window for the downgrade reconciliation pass. Rather than calling
// stripe.subscriptions.retrieve() once per paid profile (O(N) Stripe round
// trips), we rely on customer.subscription.deleted/updated webhooks for the
// authoritative downgrade, and here only reconcile profiles whose Stripe sub
// is NOT present in the active set we just paged through. We additionally cap
// the per-run reconcile to recently-updated profiles to bound work.
const DOWNGRADE_WINDOW_DAYS = 35;

async function notifyDustin(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.NOTIFY_TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    });
  } catch (err) {
    console.error('[sync] Telegram notify error:', err);
  }
}

export async function POST(request: NextRequest) {
  // Require either a valid CRON_SECRET bearer (constant-time compare; fails
  // closed if CRON_SECRET is unset) OR an authenticated admin user.
  // The spoofable x-vercel-cron header is NOT treated as an auth bypass —
  // Vercel cron can send the Authorization: Bearer <CRON_SECRET> header.
  const cronError = requireCronSecret(request);
  if (cronError) {
    const user = await getAuthedUser(request);
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  console.log('[sync] Starting subscription sync...');

  const fixed: string[] = [];
  const errors: string[] = [];
  let checked = 0;

  try {
    // ------------------------------------------------------------------
    // 1) Page through all active Stripe subscriptions and collect them in
    //    memory (bounded by Stripe's active-sub count). Track the set of
    //    active subscription IDs + customer IDs for the downgrade pass.
    // ------------------------------------------------------------------
    type ActiveSub = {
      tier: 'pro' | 'inner_circle';
      email: string;
      stripeCustomerId: string;
      subscriptionId: string;
    };
    const activeSubs: ActiveSub[] = [];
    const activeSubIds = new Set<string>();

    for await (const subscription of stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.customer'],
    }) as AsyncIterable<Stripe.Subscription>) {
      checked++;
      activeSubIds.add(subscription.id);

      const priceId = subscription.items.data[0]?.price.id;
      const correctTier = priceId ? PRICE_TO_TIER[priceId] : null;
      if (!correctTier) continue; // not one of our plans

      const customer = subscription.customer as Stripe.Customer;
      const email = customer.email;
      const stripeCustomerId = customer.id;
      if (!email) continue;

      activeSubs.push({ tier: correctTier, email, stripeCustomerId, subscriptionId: subscription.id });
    }

    // ------------------------------------------------------------------
    // 2) Batch-load the matching profiles in two queries (by customer id and
    //    by email) instead of 1-2 queries PER subscription. Build lookup maps.
    // ------------------------------------------------------------------
    const customerIds = [...new Set(activeSubs.map(s => s.stripeCustomerId))];
    const emails = [...new Set(activeSubs.map(s => s.email))];

    type ProfileRow = { id: string; subscription_tier: string; email: string; stripe_customer_id: string | null };
    const byCustomerId = new Map<string, ProfileRow>();
    const byEmail = new Map<string, ProfileRow>();

    if (customerIds.length > 0) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('id, subscription_tier, email, stripe_customer_id')
        .in('stripe_customer_id', customerIds);
      for (const p of (data as ProfileRow[] | null) || []) {
        if (p.stripe_customer_id) byCustomerId.set(p.stripe_customer_id, p);
      }
    }
    if (emails.length > 0) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('id, subscription_tier, email, stripe_customer_id')
        .in('email', emails);
      for (const p of (data as ProfileRow[] | null) || []) {
        if (p.email) byEmail.set(p.email, p);
      }
    }

    // ------------------------------------------------------------------
    // 3) Reconcile in memory; issue only the writes that are actually needed.
    // ------------------------------------------------------------------
    for (const s of activeSubs) {
      const matchedByCustomer = byCustomerId.get(s.stripeCustomerId);
      const profile = matchedByCustomer || byEmail.get(s.email) || null;

      if (!profile) {
        errors.push(`No profile for ${s.email} (${s.stripeCustomerId}) — manual fix needed`);
        continue;
      }

      if (profile.subscription_tier !== s.tier) {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_tier: s.tier,
            subscription_status: 'active',
            stripe_customer_id: s.stripeCustomerId,
            stripe_subscription_id: s.subscriptionId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);
        if (error) {
          errors.push(`Failed to fix ${s.email}: ${error.message}`);
        } else {
          const msg = `Fixed ${s.email}: ${profile.subscription_tier} → ${s.tier}`;
          console.log('[sync]', msg);
          fixed.push(msg);
        }
      } else if (!matchedByCustomer) {
        // Tier correct but stripe_customer_id missing — patch it.
        await supabaseAdmin
          .from('profiles')
          .update({
            stripe_customer_id: s.stripeCustomerId,
            stripe_subscription_id: s.subscriptionId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);
      }
    }

    // ------------------------------------------------------------------
    // 4) Downgrade pass (bounded). Authoritative downgrades come from the
    //    customer.subscription.deleted/updated and invoice.payment_failed
    //    webhooks. Here we only reconcile paid profiles whose stored
    //    stripe_subscription_id is NOT in the active set we just paged, and
    //    only those updated within a recent window — no per-profile
    //    stripe.subscriptions.retrieve() loop.
    // ------------------------------------------------------------------
    const windowStart = new Date(Date.now() - DOWNGRADE_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { data: paidProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, subscription_tier, stripe_subscription_id, updated_at')
      .neq('subscription_tier', 'free')
      .not('stripe_subscription_id', 'is', null)
      .gte('updated_at', windowStart);

    if (paidProfiles) {
      for (const profile of paidProfiles as { id: string; email: string; subscription_tier: string; stripe_subscription_id: string }[]) {
        if (activeSubIds.has(profile.stripe_subscription_id)) continue; // still active
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ subscription_tier: 'free', subscription_status: 'inactive', updated_at: new Date().toISOString() })
          .eq('id', profile.id);
        if (error) {
          errors.push(`Failed to downgrade ${profile.email}: ${error.message}`);
        } else {
          fixed.push(`Downgraded ${profile.email}: ${profile.subscription_tier} → free (sub ${profile.stripe_subscription_id} not in active set)`);
        }
      }
    }

    const summary = `[sync] Done. Checked ${checked} active subs. Fixed: ${fixed.length}. Errors: ${errors.length}.`;
    console.log(summary);

    // Only notify Dustin if something was actually fixed
    if (fixed.length > 0) {
      await notifyDustin(
        `🔧 <b>Auto-sync fixed ${fixed.length} account(s):</b>\n\n` +
        fixed.map(f => `• ${f}`).join('\n') +
        (errors.length > 0 ? `\n\n⚠️ ${errors.length} error(s):\n` + errors.map(e => `• ${e}`).join('\n') : '')
      );
    }

    return NextResponse.json({ checked, fixed, errors });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[sync] Fatal error:', msg);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Allow GET for Vercel cron (cron calls GET by default)
export async function GET(request: NextRequest) {
  return POST(request);
}
