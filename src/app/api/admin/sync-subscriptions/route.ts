import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map Stripe price IDs to tiers (same as webhook)
const PRICE_TO_TIER: Record<string, 'pro' | 'inner_circle'> = {
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '']: 'pro',
  [process.env.STRIPE_PRO_ANNUAL_PRICE_ID || '']: 'pro',
  [process.env.STRIPE_IC_MONTHLY_PRICE_ID || '']: 'inner_circle',
  [process.env.STRIPE_IC_ANNUAL_PRICE_ID || '']: 'inner_circle',
};

const CC_LISTS = {
  free: '6ed164ce-017a-11f1-a92b-0242340da00b',
  pro: '8807bcb0-053d-11f1-ac8d-0242d66c4631',
  inner_circle: 'ddceae1c-054a-11f1-bdec-02425936aa0c',
};

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
  // Secure with a shared secret — can be called by Vercel cron (no auth header)
  // or externally with the CRON_SECRET header
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'sync-secret';

  // Allow Vercel cron calls (no auth) OR authenticated external calls
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const isAuthed = authHeader === `Bearer ${cronSecret}`;

  if (!isVercelCron && !isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  console.log('[sync] Starting subscription sync...');

  const fixed: string[] = [];
  const errors: string[] = [];
  let checked = 0;

  try {
    // Page through all active subscriptions in Stripe
    for await (const subscription of stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.customer'],
    }) as AsyncIterable<Stripe.Subscription>) {
      checked++;

      const priceId = subscription.items.data[0]?.price.id;
      const correctTier = priceId ? PRICE_TO_TIER[priceId] : null;
      if (!correctTier) continue; // not one of our plans

      const customer = subscription.customer as Stripe.Customer;
      const email = customer.email;
      const stripeCustomerId = customer.id;

      if (!email) continue;

      // Find the profile by stripe_customer_id first, then by email
      let profile: { id: string; subscription_tier: string; email: string } | null = null;

      const { data: byCustomer } = await supabaseAdmin
        .from('profiles')
        .select('id, subscription_tier, email')
        .eq('stripe_customer_id', stripeCustomerId)
        .maybeSingle();

      if (byCustomer) {
        profile = byCustomer;
      } else {
        const { data: byEmail } = await supabaseAdmin
          .from('profiles')
          .select('id, subscription_tier, email')
          .eq('email', email)
          .maybeSingle();
        profile = byEmail;
      }

      if (!profile) {
        // No profile at all — user paid but never created an account
        // (edge case: they checked out without signing up and auto-register failed)
        errors.push(`No profile for ${email} (${stripeCustomerId}) — manual fix needed`);
        continue;
      }

      // Check if tier is wrong
      if (profile.subscription_tier !== correctTier) {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_tier: correctTier,
            subscription_status: 'active',
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        if (error) {
          errors.push(`Failed to fix ${email}: ${error.message}`);
        } else {
          const msg = `Fixed ${email}: ${profile.subscription_tier} → ${correctTier}`;
          console.log('[sync]', msg);
          fixed.push(msg);
        }
      } else {
        // Tier is correct but stripe_customer_id might be missing — patch it
        if (!byCustomer) {
          await supabaseAdmin
            .from('profiles')
            .update({
              stripe_customer_id: stripeCustomerId,
              stripe_subscription_id: subscription.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);
        }
      }
    }

    // Also check for cancelled subs — downgrade anyone whose Stripe sub is gone
    const { data: paidProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, subscription_tier, stripe_subscription_id')
      .neq('subscription_tier', 'free')
      .not('stripe_subscription_id', 'is', null);

    if (paidProfiles) {
      for (const profile of paidProfiles) {
        try {
          const sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
          if (sub.status !== 'active' && sub.status !== 'trialing') {
            await supabaseAdmin
              .from('profiles')
              .update({ subscription_tier: 'free', subscription_status: 'inactive', updated_at: new Date().toISOString() })
              .eq('id', profile.id);
            fixed.push(`Downgraded ${profile.email}: ${profile.subscription_tier} → free (sub status: ${sub.status})`);
          }
        } catch {
          // Sub not found in Stripe — downgrade
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_tier: 'free', subscription_status: 'inactive', updated_at: new Date().toISOString() })
            .eq('id', profile.id);
          fixed.push(`Downgraded ${profile.email}: sub not found in Stripe`);
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
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Allow GET for Vercel cron (cron calls GET by default)
export async function GET(request: NextRequest) {
  return POST(request);
}
