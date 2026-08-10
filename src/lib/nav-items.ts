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

// Keep the public navigation focused on the sections that are currently part
// of AgentAIBrief. Older utility routes may remain in the codebase, but they
// are intentionally not advertised in the primary navigation.
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'News', icon: '📰' },
  { href: '/ai-transformation', label: 'AI Transformation', icon: '⚙️' },
  { href: '/blog', label: 'Blog', icon: '📝' },
];

/**
 * Curated subset for the compact marketing header on the homepage. Derived
 * from NAV_ITEMS (by href) so it can never point at a route that doesn't exist
 * in the canonical list.
 */
const HOME_NAV_HREFS = ['/ai-transformation', '/blog'];
export const HOME_NAV_ITEMS: NavItem[] = HOME_NAV_HREFS.map(
  (href) => NAV_ITEMS.find((i) => i.href === href)!,
).filter(Boolean);

/** Support / legal items shown lower in menus. */
export const SUPPORT_MAILTO =
  'mailto:dustin@foxhomesteam.com?subject=AgentAIBrief Support';
