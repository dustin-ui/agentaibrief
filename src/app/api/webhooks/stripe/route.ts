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

async function updateProfile(userId: string, tier: 'pro' | 'inner_circle' | 'free', stripeCustomerId?: string, stripeSubscriptionId?: string) {
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
  const { data } = await supabaseAdmin.from('profiles').select('id').eq('stripe_customer_id', customerId).single();
  return data?.id ?? null;
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

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      let userId = session.client_reference_id;
      const email = session.customer_details?.email;
      const firstName = session.customer_details?.name?.split(' ')[0];

      // If no client_reference_id, look up user by email
      if (!userId && email) {
        const { data } = await supabaseAdmin.from('profiles').select('id').eq('email', email).single();
        if (data) userId = data.id;
        else console.log(`[webhook] No profile found for email: ${email}`);
      }

      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0]?.price.id;
        const tier = priceId ? PRICE_TO_TIER[priceId] : null;

        if (userId && tier) {
          await updateProfile(userId, tier, session.customer as string, session.subscription as string);
        }

        if (email && tier) {
          const lists = [CC_LISTS.free, CC_LISTS[tier]];
          await addToCC(email, lists, firstName);
        }

        // Notify Dustin of new paid subscriber
        if (email && tier) {
          const tierLabel = tier === 'inner_circle' ? 'Inner Circle ($99/mo)' : 'Pro ($19/mo)';
          await notifyDustin(`🎉 <b>New Paid Subscriber!</b>\n\n${firstName || 'Someone'} (${email}) just subscribed to <b>${tierLabel}</b> on AgentAIBrief!`);
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const tier = priceId ? PRICE_TO_TIER[priceId] : null;
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.toString();
      const userId = await findUserByStripeCustomer(customerId);

      if (userId && tier) {
        await updateProfile(userId, tier, undefined, subscription.id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.toString();
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
