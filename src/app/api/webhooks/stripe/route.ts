import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';

// CC List IDs by tier
const CC_LISTS = {
  free: '6ed164ce-017a-11f1-a92b-0242340da00b',
  pro: '8807bcb0-053d-11f1-ac8d-0242d66c4631',
  'inner-circle': 'ddceae1c-054a-11f1-bdec-02425936aa0c',
};

// Map Stripe price IDs to tiers
const PRICE_TO_TIER: Record<string, 'pro' | 'inner-circle'> = {
  'price_1SyOXcLkSTdcJUwxORq7h7AT': 'pro',       // Pro monthly
  'price_1SyOXcLkSTdcJUwxWJSqmkMS': 'pro',       // Pro annual
  'price_1SyOXdLkSTdcJUwxyayQCT1g': 'inner-circle', // IC monthly
  'price_1SyOXdLkSTdcJUwxgWzEF9OZ': 'inner-circle', // IC annual
};

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.CC_CLIENT_ID;
  const clientSecret = process.env.CC_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  // Try to refresh using stored refresh token
  const refreshToken = process.env.CC_REFRESH_TOKEN;
  if (!refreshToken) return null;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  try {
    const res = await fetch('https://authz.constantcontact.com/oauth2/default/v1/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token;
  } catch {
    return null;
  }
}

async function addToCC(email: string, listIds: string[], firstName?: string) {
  const token = await getAccessToken();
  if (!token) {
    console.log('[webhook] CC token unavailable, skipping CC add');
    return;
  }

  const body: Record<string, unknown> = {
    email_address: email,
    list_memberships: listIds,
    create_source: 'Account',
  };
  if (firstName) body.first_name = firstName;

  const res = await fetch('https://api.cc.email/v3/contacts/sign_up_form', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error('[webhook] CC add failed:', await res.text());
  } else {
    console.log(`[webhook] Added ${email} to CC lists: ${listIds.join(', ')}`);
  }
}

async function sendWelcomeEmail(email: string, tier: 'pro' | 'inner-circle') {
  // Use Stripe's receipt + a custom email via CC
  const token = await getAccessToken();
  if (!token) return;

  const tierName = tier === 'pro' ? 'Pro' : 'Inner Circle';
  const subject = `Welcome to AgentAIBrief ${tierName}! 🎉`;
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1a1a2e;">Welcome to AgentAIBrief ${tierName}!</h1>
      <p>Hey there! 👋</p>
      <p>Thanks for subscribing to AgentAIBrief <strong>${tierName}</strong>. You're now part of an exclusive group of agents staying ahead of AI.</p>
      
      <h2 style="color: #3b82f6;">What happens next?</h2>
      <ul>
        <li>📧 You'll receive your first ${tierName} briefing within 24 hours</li>
        <li>🔑 Access the full briefing feed at <a href="https://agentaibrief.com/demo">agentaibrief.com/demo</a></li>
        ${tier === 'inner-circle' ? '<li>💬 You\'ll get a private group invite from Dustin Fox within 24 hours</li><li>📅 Weekly live Q&A sessions — calendar invite coming soon</li>' : '<li>📚 Full implementation guides and tool reviews included</li>'}
      </ul>
      
      <p>Questions? Just reply to this email — Dustin reads every one.</p>
      
      <p style="margin-top: 30px;">— The AgentAIBrief Team</p>
      <p style="color: #666; font-size: 12px;">Built by Dustin Fox | Fox Homes Team | $277M in sales volume | 2,102 five-star reviews</p>
    </div>
  `;

  // Send via CC single email activity
  try {
    const res = await fetch('https://api.cc.email/v3/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Welcome - ${tierName} - ${email} - ${new Date().toISOString()}`,
        email_campaign_activities: [{
          format_type: 5,
          from_email: 'dustin@foxhomesteam.com',
          from_name: 'Dustin Fox - AgentAIBrief',
          reply_to_email: 'dustin@foxhomesteam.com',
          subject,
          html_content: htmlBody,
          physical_address_in_footer: {
            address_line1: 'Fox Homes Team',
            city: 'Fairfax',
            state_code: 'VA',
            postal_code: '22030',
            country_code: 'US',
          },
        }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[webhook] CC welcome email creation failed:', errText);
      // Fall back: just log it, the CC list add is the important part
    } else {
      console.log(`[webhook] Welcome email queued for ${email} (${tierName})`);
    }
  } catch (err) {
    console.error('[webhook] Welcome email error:', err);
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Webhook signature verification failed';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;
      const firstName = session.customer_details?.name?.split(' ')[0];

      console.log('✅ Checkout completed:', {
        customerEmail: email,
        customerId: session.customer,
        subscriptionId: session.subscription,
        amountTotal: session.amount_total,
      });

      if (email && session.subscription) {
        // Get subscription to determine tier from price ID
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = subscription.items.data[0]?.price.id;
        const tier = priceId ? PRICE_TO_TIER[priceId] : null;

        if (tier) {
          // Add to both free list (they get free emails too) and their tier list
          const lists = [CC_LISTS.free, CC_LISTS[tier]];
          await addToCC(email, lists, firstName);
          await sendWelcomeEmail(email, tier);
          console.log(`[webhook] ${email} added to ${tier} tier`);
        } else {
          // Unknown price, just add to free
          await addToCC(email, [CC_LISTS.free], firstName);
          console.log(`[webhook] ${email} added to free (unknown price: ${priceId})`);
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('❌ Subscription cancelled:', {
        customerId: subscription.customer,
        subscriptionId: subscription.id,
      });
      // TODO: Remove from paid list, keep on free list
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
