import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { addSubscriber } from '@/lib/constant-contact';
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

// CC List IDs by tier
const CC_LISTS = {
  free: '6ed164ce-017a-11f1-a92b-0242340da00b',
  pro: '8807bcb0-053d-11f1-ac8d-0242d66c4631',
  'inner_circle': 'ddceae1c-054a-11f1-bdec-02425936aa0c',
};

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

async function updateProfile(
  userId: string,
  tier: 'pro' | 'inner_circle' | 'free',
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
) {
  const update: Record<string, unknown> = {
    subscription_tier: tier,
    subscription_status: tier === 'free' ? 'inactive' : 'active',
    updated_at: new Date().toISOString(),
  };
  if (stripeCustomerId) update.stripe_customer_id = stripeCustomerId;
  if (stripeSubscriptionId) update.stripe_subscription_id = stripeSubscriptionId;

  const { error } = await supabaseAdmin.from('profiles').update(update).eq('id', userId);
  if (error) console.error('[webhook] Profile update error:', error);
  else console.log(`[webhook] Updated profile ${userId} to ${tier}`);
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

  // Create profile row
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: userId,
    email,
    full_name: firstName || null,
    subscription_tier: tier,
    subscription_status: 'active',
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    console.error('[webhook] Failed to create profile:', profileError);
    // Don't return null — auth user was created, profile may partially exist
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
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // UUID v4 pattern — only valid Supabase user IDs should be used as client_reference_id
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
            // Existing user — update their profile
            await updateProfile(userId, tier, stripeCustomerId, session.subscription as string);
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
          }

          // Add to CC lists
          if (email) {
            const lists = [CC_LISTS.free, CC_LISTS[tier]];
            await addToCC(email, lists, firstName);
          }

          // Notify Dustin
          if (email) {
            const tierLabel = tier === 'inner_circle' ? 'Inner Circle ($99/mo)' : 'Pro ($19/mo)';
            const isNew = !session.client_reference_id;
            await notifyDustin(
              `🎉 <b>New Paid Subscriber!</b>\n\n` +
              `${firstName || 'Someone'} (${email}) just subscribed to <b>${tierLabel}</b> on AgentAIBrief!` +
              (isNew ? '\n\n<i>Auto-registered (paid without existing account) — magic link sent.</i>' : '')
            );
          }
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const tier = priceId ? PRICE_TO_TIER[priceId] : null;
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.toString();
      const userId = await findUserByStripeCustomer(customerId);

      if (userId && tier) {
        await updateProfile(userId, tier, undefined, subscription.id);
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
        await updateProfile(userId, 'free');
      }
      break;
    }

    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
