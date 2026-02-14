export interface NewsletterStory {
  headline: string;
  summary: string;
  sourceUrl?: string;
  imageUrl?: string;
  category?: string;
}

export interface NewsletterListing {
  address: string;
  price: string;
  beds: number;
  baths: number;
  sqft?: string;
  imageUrl?: string;
  listingUrl?: string;
  agentName?: string;
  hook?: string;
}

export interface MarketPulse {
  stat: string;
  label: string;
  detail: string;
}

export interface NewsletterProfile {
  agent_name: string;
  brokerage: string;
  brokerage_address?: string;
  team_name?: string;
  phone?: string;
  email: string;
  headshot_url?: string;
  logo_url?: string;
  brand_color: string;
}

export function generateNewsletterHTML(
  profile: NewsletterProfile,
  stories: NewsletterStory[],
  edition_date?: string,
  options?: {
    subjectLine?: string;
    listings?: NewsletterListing[];
    marketPulse?: MarketPulse;
    quickHits?: { text: string; url: string }[];
    sellerCTA?: { headline: string; body: string; buttonText: string; buttonUrl: string };
  }
): string {
  const c = profile.brand_color || '#37b0c9';
  const cLight = c + '18';
  const date = edition_date || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const teamLine = profile.team_name ? `${profile.team_name} · ` : '';

  // Top 3 stories — big feature cards
  const topStories = stories.slice(0, 3);
  const remainingStories = stories.slice(3, 8);

  const topStoriesHTML = topStories.map((s, i) => `
    <tr><td style="padding:0 0 ${i < topStories.length - 1 ? '20' : '0'}px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;background:#ffffff;">
        ${s.imageUrl ? `<tr><td>
          <a href="${s.sourceUrl || '#'}" style="text-decoration:none;">
            <img src="${s.imageUrl}" alt="" width="560" style="width:100%;height:auto;display:block;border-radius:12px 12px 0 0;" />
          </a>
        </td></tr>` : ''}
        <tr><td style="padding:20px 24px 24px 24px;">
          ${s.category ? `<span style="display:inline-block;background:${cLight};color:${c};font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">${s.category}</span><br/>` : ''}
          <a href="${s.sourceUrl || '#'}" style="color:#1a1a1a;font-size:20px;font-weight:700;text-decoration:none;line-height:1.3;display:block;margin-top:4px;">${s.headline}</a>
          <p style="color:#555555;font-size:15px;line-height:1.6;margin:10px 0 14px 0;">${s.summary || ''}</p>
          <a href="${s.sourceUrl || '#'}" style="color:${c};font-size:14px;text-decoration:none;font-weight:600;">Read the full story →</a>
        </td></tr>
      </table>
    </td></tr>`).join('\n');

  // Quick hits — remaining stories as compact list
  const quickHitsHTML = remainingStories.length > 0 ? `
    <tr><td style="padding:28px 0 0 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:12px;">
        <tr><td style="padding:20px 24px 8px 24px;">
          <span style="font-size:16px;font-weight:700;color:#1a1a1a;">⚡ Quick Hits</span>
        </td></tr>
        ${remainingStories.map(s => `
        <tr><td style="padding:8px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width:8px;vertical-align:top;padding-top:6px;">
                <div style="width:6px;height:6px;border-radius:50%;background:${c};"></div>
              </td>
              <td style="padding-left:12px;">
                <a href="${s.sourceUrl || '#'}" style="color:#1a1a1a;font-size:15px;font-weight:600;text-decoration:none;line-height:1.4;">${s.headline}</a>
                ${s.summary ? `<p style="color:#777;font-size:13px;margin:2px 0 0 0;line-height:1.4;">${s.summary}</p>` : ''}
              </td>
            </tr>
          </table>
        </td></tr>`).join('\n')}
        <tr><td style="padding:8px 24px 20px 24px;"></td></tr>
      </table>
    </td></tr>` : '';

  // Extra quick hits from options
  const extraQuickHitsHTML = options?.quickHits?.length ? `
    <tr><td style="padding:20px 0 0 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:12px;">
        <tr><td style="padding:20px 24px 8px 24px;">
          <span style="font-size:16px;font-weight:700;color:#1a1a1a;">🔗 More This Week</span>
        </td></tr>
        ${options.quickHits.map(h => `
        <tr><td style="padding:6px 24px;">
          <a href="${h.url}" style="color:${c};font-size:14px;text-decoration:none;font-weight:500;">→ ${h.text}</a>
        </td></tr>`).join('\n')}
        <tr><td style="padding:8px 24px 20px 24px;"></td></tr>
      </table>
    </td></tr>` : '';

  // Market pulse
  const marketPulseHTML = options?.marketPulse ? `
    <tr><td style="padding:28px 0 0 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c};border-radius:12px;">
        <tr><td style="padding:28px 24px;text-align:center;">
          <span style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:1px;">📊 Market Pulse</span><br/>
          <span style="font-size:36px;font-weight:800;color:#ffffff;line-height:1.3;">${options.marketPulse.stat}</span><br/>
          <span style="font-size:15px;font-weight:600;color:#ffffff;">${options.marketPulse.label}</span><br/>
          <span style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:4px;display:inline-block;">${options.marketPulse.detail}</span>
        </td></tr>
      </table>
    </td></tr>` : '';

  // Seller CTA
  const sellerCTAHTML = options?.sellerCTA ? `
    <tr><td style="padding:28px 0 0 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1a1a1a;border-radius:12px;border:1px solid #333;">
        <tr><td style="padding:32px 28px;text-align:center;">
          <span style="font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${options.sellerCTA.headline}</span>
          <p style="color:#aaaaaa;font-size:15px;line-height:1.6;margin:12px 0 20px 0;">${options.sellerCTA.body}</p>
          <a href="${options.sellerCTA.buttonUrl}" style="display:inline-block;background:${c};color:#ffffff;font-size:16px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">${options.sellerCTA.buttonText}</a>
        </td></tr>
      </table>
    </td></tr>` : '';

  // Featured listings
  const listingsHTML = options?.listings?.length ? `
    <tr><td style="padding:28px 0 0 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding:0 0 16px 0;">
          <span style="font-size:18px;font-weight:700;color:#1a1a1a;">🏠 Featured Listings</span>
        </td></tr>
        ${options.listings.map(l => `
        <tr><td style="padding:0 0 16px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
            ${l.imageUrl ? `<tr><td>
              <a href="${l.listingUrl || '#'}" style="text-decoration:none;">
                <img src="${l.imageUrl}" alt="${l.address}" width="560" style="width:100%;height:auto;display:block;" />
              </a>
            </td></tr>` : ''}
            <tr><td style="padding:16px 20px;">
              ${l.hook ? `<p style="color:${c};font-size:13px;font-weight:600;margin:0 0 6px 0;font-style:italic;">"${l.hook}"</p>` : ''}
              <a href="${l.listingUrl || '#'}" style="color:#1a1a1a;font-size:17px;font-weight:700;text-decoration:none;">${l.address}</a>
              <p style="color:#555;font-size:14px;margin:4px 0 0 0;">
                <strong style="color:${c};">${l.price}</strong> · ${l.beds} bed · ${l.baths} bath${l.sqft ? ` · ${l.sqft} sq ft` : ''}
              </p>
              ${l.agentName ? `<p style="color:#999;font-size:12px;margin:6px 0 0 0;">Presented by: ${l.agentName}</p>` : ''}
            </td></tr>
          </table>
        </td></tr>`).join('\n')}
      </table>
    </td></tr>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${options?.subjectLine || 'Your Weekly Local News Briefing'}</title>
<!--[if mso]><style>table{border-collapse:collapse;}td{font-family:Arial,sans-serif;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f0f0;">
<tr><td align="center" style="padding:24px 12px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

<!-- Logo + Agent Header -->
<tr><td style="padding:0 0 4px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:12px 12px 0 0;">
    <tr><td style="padding:28px 24px;text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" align="center"><tr>
        ${profile.headshot_url ? `<td style="vertical-align:middle;padding-right:16px;">
          <img src="${profile.headshot_url}" alt="${profile.agent_name}" width="64" height="64" style="width:64px;height:64px;border-radius:50%;border:3px solid ${c};display:block;object-fit:cover;" />
        </td>` : ''}
        <td style="vertical-align:middle;text-align:left;">
          <span style="font-size:20px;font-weight:800;color:#1a1a1a;">${profile.agent_name}</span><br/>
          <span style="color:#777;font-size:13px;">${teamLine}${profile.brokerage}</span>
        </td>
      </tr></table>
    </td></tr>
  </table>
</td></tr>

<!-- Title bar -->
<tr><td style="padding:0 0 4px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c};">
    <tr><td style="padding:16px 24px;text-align:center;">
      <span style="color:#ffffff;font-size:20px;font-weight:700;">Your Weekly Local Briefing</span><br/>
      <span style="color:rgba(255,255,255,0.85);font-size:13px;">${date}</span>
    </td></tr>
  </table>
</td></tr>

<!-- Main content area -->
<tr><td style="padding:24px 20px;background:#f7f7f7;border-radius:0 0 12px 12px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">

    <!-- Top Stories -->
    <tr><td style="padding:0 0 4px 0;">
      <span style="font-size:13px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px;">🔥 This Week&#39;s Top Stories</span>
    </td></tr>
    <tr><td style="padding:12px 0 0 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${topStoriesHTML}
      </table>
    </td></tr>

    ${quickHitsHTML}
    ${marketPulseHTML}
    ${sellerCTAHTML}
    ${listingsHTML}
    ${extraQuickHitsHTML}

  </table>
</td></tr>

<!-- Agent Contact Footer -->
<tr><td style="padding:24px 0 0 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1a1a1a;border-radius:12px;">
    <tr><td style="padding:28px 24px;text-align:center;">
      ${profile.logo_url ? `<img src="${profile.logo_url}" alt="${profile.brokerage}" style="max-height:40px;width:auto;display:block;margin:0 auto 16px auto;" />` : ''}
      <span style="font-size:18px;font-weight:700;color:#ffffff;">${profile.agent_name}</span><br/>
      <span style="color:#999;font-size:14px;">${teamLine}${profile.brokerage}</span><br/>
      ${profile.brokerage_address ? `<span style="color:#777;font-size:12px;">${profile.brokerage_address}</span><br/>` : ''}
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-top:12px;">
        <tr>
          ${profile.phone ? `<td style="padding:0 8px;">
            <a href="tel:${profile.phone}" style="display:inline-block;background:${c};color:#ffffff;font-size:13px;font-weight:600;padding:8px 20px;border-radius:6px;text-decoration:none;">📱 Call ${profile.phone}</a>
          </td>` : ''}
          <td style="padding:0 8px;">
            <a href="mailto:${profile.email}" style="display:inline-block;background:#333;color:#ffffff;font-size:13px;font-weight:600;padding:8px 20px;border-radius:6px;text-decoration:none;">✉️ Email Me</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</td></tr>

<!-- Powered by footer -->
<tr><td style="padding:20px 0 0 0;text-align:center;">
  <span style="color:#999;font-size:11px;">Powered by </span>
  <a href="https://agentaibrief.com?utm_source=newsletter&utm_medium=email&utm_campaign=agent_newsletter" style="color:${c};font-size:11px;text-decoration:none;font-weight:600;">AgentAIBrief</a>
  <span style="color:#999;font-size:11px;"> · </span>
  <a href="https://agentaibrief.com/newsletter-builder?utm_source=newsletter&utm_medium=email&utm_campaign=agent_newsletter" style="color:${c};font-size:11px;text-decoration:none;">Get your own AI newsletter →</a>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
