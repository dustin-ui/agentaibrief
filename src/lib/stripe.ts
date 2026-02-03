import Stripe from 'stripe';

// Initialize Stripe client (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
  typescript: true,
});

// Price IDs — replace placeholders with real Stripe price IDs in .env
export const PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
  PRO_ANNUAL: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual',
  INNER_CIRCLE_MONTHLY: process.env.STRIPE_IC_MONTHLY_PRICE_ID || 'price_ic_monthly',
  INNER_CIRCLE_ANNUAL: process.env.STRIPE_IC_ANNUAL_PRICE_ID || 'price_ic_annual',
} as const;
