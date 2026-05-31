import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { addSubscriber } from '@/lib/constant-contact';
import { ccListsForTier } from '@/lib/config';
import Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map Stripe price IDs to tiers
const PRICE_TO_TIER: Record<string, 'pro' | 'inner_circle'> = {
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '']: 'pro',
  [process.env.STRIPE_PRO_ANNUAL_PRICE_ID || '']: 'pro',
  [process.env.STRIPE_IC_MONTHLY_PRICE_ID || '']: 'inner_circle',
  [process.env.STRIPE_IC_ANNUAL_PRICE_ID || '']: 'inner_circle',
};

// CC List IDs are centralized in @/lib/config (CC_LISTS).

async function addToCC(email: string, listIds: string[], firstName?: string) {
  try {
    await addSubscriber(email, listIds, undefined, firstName);
    console.log(`[webhook] Added ${email} to CC lists: ${listIds.join(', ')}`);
  } catch (err) {
    console.error('[webhook] CC add failed:', err);
  }
}

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
    console.error('[webhook] Telegram notify error:', err);
  }
}

/**
 * Update a profile's subscription state. Returns true on success, false on
 * failure so the webhook handler can decide whether to return a non-2xx and
 * let Stripe retry (critical-path data integrity).
 */
async function updateProfile(
  userId: string,
  tier: 'pro' | 'inner_circle' | 'free',
  status: 'active' | 'inactive' | 'past_due',
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<boolean> {
  const update: Record<string, unknown> = {
    subscription_tier: tier,
    subscription_status: status,
    updated_at: new Date().toISOString(),
  };
  if (stripeCustomerId) update.stripe_customer_id = stripeCustomerId;
  if (stripeSubscriptionId) update.stripe_subscription_id = stripeSubscriptionId;

  const { error } = await supabaseAdmin.from('profiles').update(update).eq('id', userId);
  if (error) {
    console.error('[webhook] Profile update error:', error);
    return false;
  }
  console.log(`[webhook] Updated profile ${userId} to ${tier}/${status}`);
  return true;
}

async function findUserByStripeCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  return data?.id ?? null;
}

/**
 * Auto-register a new paid user who checked out without having an account.
 * Creates a Supabase auth user + profile, then sends them a magic link to set their password.
 */
async function createPaidUser(
  email: string,
  firstName: string | undefined,
  tier: 'pro' | 'inner_circle',
  stripeCustomerId: string,
  stripeSubscriptionId: string
): Promise<string | null> {
  // Create auth user (no password — they'll set one via magic link)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true, // mark email as confirmed since they just paid
  });

  if (authError || !authData.user) {
    console.error('[webhook] Failed to create auth user:', authError);
    return null;
  }

  const userId = authData.user.id;

  // Create profile row. Use upsert so a partially-created profile (e.g. created
  // by a Supabase auth trigger) does not cause a silent insert failure that
  // leaves the paid user without their tier.
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert(
    {
      id: userId,
      email,
      full_name: firstName || null,
      subscription_tier: tier,
      subscription_status: 'active',
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    // One retry as a plain update keyed by id, in case the row already exists
    // and the upsert raced. Surface the failure to the caller if this also fails.
    console.error('[webhook] Failed to upsert profile, retrying as update:', profileError);
    const { error: retryError } = await supabaseAdmin
      .from('profiles')
      .update({
        email,
        subscription_tier: tier,
        subscription_status: 'active',
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    if (retryError) {
      console.error('[webhook] Profile create retry also failed:', retryError);
      notifyDustin(
        `\u26a0\ufe0f <b>Webhook profile create failed</b>\n\nPaid user ${email} (${tier}) could not be written to profiles. Manual fix needed.`
      ).catch(() => {});
      // Return null so the handler treats this as a critical-path failure and
      // returns a non-2xx, letting Stripe retry the event.
      return null;
    }
  }

  // Send magic link so they can set a password and log in
  try {
    const { error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agentaibrief.com'}/success?plan=${tier}`,
      },
    });
    if (linkError) console.error('[webhook] Magic link error:', linkError);
    else console.log(`[webhook] Magic link sent to ${email}`);
  } catch (err) {
    console.error('[webhook] Failed to send magic link:', err);
  }

  console.log(`[webhook] Auto-registered new paid user ${email} as ${tier} (id: ${userId})`);
  return userId;
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Verification failed';
    console.error('[webhook] Signature verification failed:', msg);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // UUID v4 pattern — only valid Supabase user IDs should be used as client_reference_id
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // If a critical-path profiles write fails, we return a non-2xx so Stripe retries.
  let criticalFailure = false;

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;
      const firstName = session.customer_details?.name?.split(' ')[0];
      const stripeCustomerId = session.customer as string;

      // Only use client_reference_id as userId if it's a valid UUID.
      // Old flow sometimes put referral codes here — those are NOT user IDs.
      const clientRef = session.client_reference_id;
      let userId: string | null = (clientRef && UUID_REGEX.test(clientRef)) ? clientRef : null;

      // Always attempt email lookup as a fallback (covers: no client_reference_id,
      // referral code was in client_reference_id, or user checked out while logged out)
      if (!userId && email) {
        const { data } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
        if (data) {
          userId = data.id;
          console.log(`[webhook] Found existing profile for ${email}: ${userId}`);
        }
      }

      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0]?.price.id;
        const tier = priceId ? PRICE_TO_TIER[priceId] : null;

        if (tier) {
          if (userId) {
            // Existing user — update their profile (critical path, must complete before returning 200)
            const ok = await updateProfile(userId, tier, 'active', stripeCustomerId, session.subscription as string);
            if (!ok) criticalFailure = true;
          } else if (email) {
            // No account exists — auto-register them as a paid user
            console.log(`[webhook] No account found for ${email} — auto-registering as ${tier}`);
            userId = await createPaidUser(
              email,
              firstName,
              tier,
              stripeCustomerId,
              session.subscription as string
            );
            // createPaidUser returns null when the profile write ultimately failed
            if (!userId) criticalFailure = true;
          }

          // Fire-and-forget CC + Telegram — don't let slow 3rd-party calls block the 200 response
          if (email) {
            const lists = ccListsForTier(tier);
            addToCC(email, lists, firstName).catch(err =>
              console.error('[webhook] CC add failed (async):', err)
            );

            const tierLabel = tier === 'inner_circle' ? 'Inner Circle ($99/mo)' : 'Pro ($19/mo)';
            const isNew = !session.client_reference_id;
            notifyDustin(
              `🎉 <b>New Paid Subscriber!</b>\n\n` +
              `${firstName || 'Someone'} (${email}) just subscribed to <b>${tierLabel}</b> on AgentAIBrief!` +
              (isNew ? '\n\n<i>Auto-registered (paid without existing account) — magic link sent.</i>' : '')
            ).catch(err => console.error('[webhook] Telegram notify failed (async):', err));
          }
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const mappedTier = priceId ? PRICE_TO_TIER[priceId] : null;
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.toString();
      const userId = await findUserByStripeCustomer(customerId);

      if (userId) {
        // Do NOT blindly upgrade on price match. Only grant the paid tier when
        // the subscription is actually active or trialing; otherwise downgrade
        // to free/inactive so Supabase state mirrors Stripe (mirrors sync jobs).
        const status = subscription.status;
        if (mappedTier && (status === 'active' || status === 'trialing')) {
          const ok = await updateProfile(userId, mappedTier, 'active', undefined, subscription.id);
          if (!ok) criticalFailure = true;
        } else if (status === 'past_due' || status === 'unpaid') {
          // Keep tier visibility but mark past_due so access can be gated.
          const ok = await updateProfile(userId, 'free', 'past_due', undefined, subscription.id);
          if (!ok) criticalFailure = true;
        } else {
          // canceled, incomplete, incomplete_expired, paused, etc -> downgrade
          const ok = await updateProfile(userId, 'free', 'inactive', undefined, subscription.id);
          if (!ok) criticalFailure = true;
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.toString();
      if (customerId) {
        const userId = await findUserByStripeCustomer(customerId);
        if (userId) {
          // Mark past_due so downstream access checks can gate paid features.
          const ok = await updateProfile(userId, 'free', 'past_due', undefined);
          if (!ok) criticalFailure = true;
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.toString();
      const userId = await findUserByStripeCustomer(customerId);

      if (userId) {
        const ok = await updateProfile(userId, 'free', 'inactive');
        if (!ok) criticalFailure = true;
      }
      break;
    }

    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  // Critical-path profiles write failed — return non-2xx so Stripe retries the
  // event instead of silently dropping a paid user's tier.
  if (criticalFailure) {
    return NextResponse.json(
      { error: 'Profile update failed; will retry' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
