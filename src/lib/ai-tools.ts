// Curated list of top AI tools for real estate agents
// Affiliate links should be added as they become available

export interface AITool {
  name: string;
  category: 'staging' | 'writing' | 'video' | 'marketing' | 'crm' | 'chatbot' | 'analytics' | 'photography';
  tagline: string;
  pricing: string;
  url: string;
  affiliateUrl?: string; // Use this when we have affiliate links
  rating: number;
  badge?: string; // e.g. "Editor's Pick", "Best Value", "Most Popular"
  isFeatured?: boolean;
}

export const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  staging: { label: 'Virtual Staging', emoji: '🏠' },
  writing: { label: 'AI Writing', emoji: '✍️' },
  video: { label: 'AI Video', emoji: '🎬' },
  marketing: { label: 'Marketing', emoji: '📣' },
  crm: { label: 'CRM & Lead Gen', emoji: '📊' },
  chatbot: { label: 'AI Chatbots', emoji: '🤖' },
  analytics: { label: 'Analytics', emoji: '📈' },
  photography: { label: 'Photography', emoji: '📸' },
};

export const AI_TOOLS: AITool[] = [
  // Virtual Staging
  {
    name: 'Apply Design AI',
    category: 'staging',
    tagline: 'AI virtual staging and redesign — stage a room in under 30 seconds for $0.20/image.',
    pricing: 'From $0.20/image',
    url: 'https://applydesign.io',
    rating: 4.8,
    badge: "Editor's Pick",
    isFeatured: true,
  },
  {
    name: 'Virtual Staging AI',
    category: 'staging',
    tagline: 'One-click AI staging with 40+ design styles. Used by 50K+ agents.',
    pricing: 'From $16/image',
    url: 'https://www.virtualstagingai.app',
    rating: 4.7,
    badge: 'Most Popular',
  },
  {
    name: 'BoxBrownie',
    category: 'photography',
    tagline: 'Professional AI photo editing, virtual staging, and 360° tours.',
    pricing: 'From $16/image',
    url: 'https://www.boxbrownie.com',
    rating: 4.8,
    badge: 'Industry Standard',
  },
  {
    name: 'REimagineHome',
    category: 'staging',
    tagline: 'AI redesign & virtual staging with exterior and landscape visualization.',
    pricing: 'From $12/month',
    url: 'https://www.reimaginehome.ai',
    rating: 4.5,
  },

  // AI Writing
  {
    name: 'ChatGPT',
    category: 'writing',
    tagline: 'The #1 AI assistant — listing descriptions, emails, social posts, market analysis.',
    pricing: 'Free / $20/mo Pro',
    url: 'https://chat.openai.com',
    rating: 4.9,
    badge: 'Most Popular',
    isFeatured: true,
  },
  {
    name: 'Claude',
    category: 'writing',
    tagline: 'Preferred by power users for long-form content, scripts, and detailed analysis.',
    pricing: 'Free / $20/mo Pro',
    url: 'https://claude.ai',
    rating: 4.8,
    badge: "Editor's Pick",
  },
  {
    name: 'Jasper',
    category: 'writing',
    tagline: 'AI marketing platform with real estate templates for listings, blogs, and ads.',
    pricing: 'From $39/month',
    url: 'https://www.jasper.ai',
    rating: 4.6,
  },

  // AI Video
  {
    name: 'HeyGen',
    category: 'video',
    tagline: 'Create AI avatar videos for listings, market updates, and multilingual content.',
    pricing: 'From $24/month',
    url: 'https://www.heygen.com',
    rating: 4.7,
    badge: 'Best for RE',
    isFeatured: true,
  },
  {
    name: 'Synthesia',
    category: 'video',
    tagline: 'Professional AI video creation with 150+ avatars — no camera needed.',
    pricing: 'From $22/month',
    url: 'https://www.synthesia.io',
    rating: 4.6,
  },
  {
    name: 'Canva AI',
    category: 'marketing',
    tagline: 'AI-powered design for social posts, flyers, presentations, and video reels.',
    pricing: 'Free / $13/mo Pro',
    url: 'https://www.canva.com',
    rating: 4.8,
    badge: 'Most Popular',
    isFeatured: true,
  },

  // CRM & Lead Gen
  {
    name: 'Follow Up Boss',
    category: 'crm',
    tagline: 'Top-rated real estate CRM with AI-powered lead routing and smart lists.',
    pricing: 'From $58/month',
    url: 'https://www.followupboss.com',
    rating: 4.7,
    badge: 'Top CRM',
  },
  {
    name: 'kvCORE',
    category: 'crm',
    tagline: 'All-in-one platform with predictive analytics and AI-driven marketing automation.',
    pricing: 'From $500/month',
    url: 'https://kvcore.com',
    rating: 4.5,
  },
  {
    name: 'Sierra Interactive',
    category: 'crm',
    tagline: 'IDX website + CRM with AI chat, automated drips, and lead management.',
    pricing: 'From $400/month',
    url: 'https://www.sierrainteractive.com',
    rating: 4.6,
  },

  // AI Chatbots
  {
    name: 'Structurely',
    category: 'chatbot',
    tagline: 'AI chatbot that qualifies leads via text and schedules showings 24/7.',
    pricing: 'From $179/month',
    url: 'https://structurely.com',
    rating: 4.6,
    badge: 'Best Chatbot',
  },
  {
    name: 'Ylopo',
    category: 'chatbot',
    tagline: 'AI-powered lead gen platform with voice AI and text conversation for nurturing.',
    pricing: 'From $295/month',
    url: 'https://ylopo.com',
    rating: 4.4,
  },

  // Analytics
  {
    name: 'HouseCanary',
    category: 'analytics',
    tagline: 'AI property valuations, market forecasts, and CanaryAI for instant research.',
    pricing: 'From $25/month',
    url: 'https://www.housecanary.com',
    rating: 4.7,
    badge: 'Best Analytics',
    isFeatured: true,
  },
  {
    name: 'Mashvisor',
    category: 'analytics',
    tagline: 'AI analytics for investment properties — cash flow projections and market insights.',
    pricing: 'From $30/month',
    url: 'https://www.mashvisor.com',
    rating: 4.5,
  },
];

export function getToolsByCategory(): Record<string, AITool[]> {
  const grouped: Record<string, AITool[]> = {};
  for (const tool of AI_TOOLS) {
    if (!grouped[tool.category]) grouped[tool.category] = [];
    grouped[tool.category].push(tool);
  }
  return grouped;
}

export function getFeaturedTools(): AITool[] {
  return AI_TOOLS.filter(t => t.isFeatured);
}
