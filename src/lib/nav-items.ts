// Single source of truth for primary site navigation.
//
// Imported by SiteNav (desktop tool-page nav), MobileNav, and the homepage
// header so the three navs can't drift apart. Every href here MUST resolve to
// a real route under src/app — dead links were previously hand-maintained in
// three places and 404'd (e.g. /neighborhood-brief, /listing-radar,
// /newsletter-builder, all removed below).

export interface NavItem {
  href: string;
  label: string;
  /** Optional emoji shown in the mobile menu. */
  icon?: string;
}

// Verified against src/app on 2026-05-30 — all routes exist.
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'News', icon: '📰' },
  { href: '/blog', label: 'Blog', icon: '📝' },
  { href: '/tools', label: 'AI Tools', icon: '🛠️' },
  { href: '/prompts', label: 'Prompts', icon: '💬' },
  { href: '/gpt-templates', label: 'GPT Templates', icon: '🤖' },
  { href: '/seo-sniper', label: 'SEO Sniper', icon: '🎯' },
  { href: '/seo-command', label: 'SEO Command', icon: '📡' },
  { href: '/listing-generator', label: 'Listing Generator', icon: '🏠' },
  { href: '/listing-description', label: 'Listing Description', icon: '✍️' },
  { href: '/content-briefing', label: 'Content Briefing', icon: '📋' },
  { href: '/contract-analyzer', label: 'Contract Analyzer', icon: '📄' },
  { href: '/market-update', label: 'Market Update', icon: '🎤' },
  { href: '/videos', label: 'Video Library', icon: '🎬' },
];

/**
 * Curated subset for the compact marketing header on the homepage. Derived
 * from NAV_ITEMS (by href) so it can never point at a route that doesn't exist
 * in the canonical list.
 */
const HOME_NAV_HREFS = ['/tools', '/prompts', '/blog', '/videos'];
export const HOME_NAV_ITEMS: NavItem[] = HOME_NAV_HREFS.map(
  (href) => NAV_ITEMS.find((i) => i.href === href)!,
).filter(Boolean);

/** Support / legal items shown lower in menus. */
export const SUPPORT_MAILTO =
  'mailto:dustin@foxhomesteam.com?subject=AgentAIBrief Support';
