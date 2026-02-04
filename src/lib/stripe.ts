import Stripe from 'stripe';

// Lazy-initialize Stripe client (server-side only)
// Returns null if STRIPE_SECRET_KEY is not set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}

// Price IDs — replace placeholders with real Stripe price IDs in .env
export const PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
  PRO_ANNUAL: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual',
  INNER_CIRCLE_MONTHLY: process.env.STRIPE_IC_MONTHLY_PRICE_ID || 'price_ic_monthly',
  INNER_CIRCLE_ANNUAL: process.env.STRIPE_IC_ANNUAL_PRICE_ID || 'price_ic_annual',
} as const;
