// Single source of truth for the site's monetization mode.
//
// While FREE_ACCESS_MODE is true the entire paid funnel is gated OFF:
//  - Homepage pricing cards hide their dollar prices and "buy" buttons and
//    instead point everyone at the free newsletter signup.
//  - /subscribe shows the simple "everything is free" email capture.
//  - Trial / checkout CTAs and "Subscribe to unlock" locks are suppressed.
//
// When monetization returns, flip FREE_ACCESS_MODE to false (or set
// NEXT_PUBLIC_FREE_ACCESS_MODE=false in the environment) and ALL of the paid
// UI returns automatically — nothing is deleted, only gated.
//
// NOTE: This is intentionally a plain boolean (not read from a runtime store)
// so it is safe to import from both server and client components. The env
// override lets Dustin toggle it without a code change.

export const FREE_ACCESS_MODE: boolean =
  process.env.NEXT_PUBLIC_FREE_ACCESS_MODE === 'false' ? false : true;

/** True when the paid funnel (prices, checkout, trial upsells) should show. */
export const PAID_MODE = !FREE_ACCESS_MODE;

/**
 * Where a generic "subscribe / get access" CTA should send the user.
 * In free mode this is the newsletter signup; in paid mode it's the pricing page.
 */
export const ACCESS_CTA_HREF = FREE_ACCESS_MODE ? '/subscribe' : '/subscribe';

/** Real sales/contact route for high-intent (Team plan) leads. */
export const CONTACT_SALES_HREF = '/contact';
