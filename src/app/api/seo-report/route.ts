import { NextRequest, NextResponse } from 'next/server';

const SEMRUSH_API_KEY = process.env.SEMRUSH_API_KEY || '';
const SEMRUSH_BASE = 'https://api.semrush.com/';
const SEMRUSH_BACKLINKS = 'https://api.semrush.com/analytics/v1/';

function parseSemrushCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(';');
  return lines.slice(1).map(line => {
    const values = line.split(';');
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h.trim()] = (values[i] || '').trim(); });
    return obj;
  });
}

async function fetchSemrush(url: string): Promise<string> {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const text = await res.text();
  if (text.startsWith('ERROR')) throw new Error(`SemRush API error: ${text}`);
  return text;
}

interface PriorityInput {
  authorityScore: number;
  organicTraffic: number;
  organicKeywords: number;
  totalBacklinks: number;
  referringDomains: number;
  keywords: Record<string, string>[];
  domain: string;
}

function generatePriorities(data: PriorityInput): { icon: string; title: string; description: string; impact: 'high' | 'medium' | 'low' }[] {
  const priorities: { icon: string; title: string; description: string; impact: 'high' | 'medium' | 'low'; score: number }[] = [];

  // Check for high-volume keywords not in top 3
  const almostThereKws = data.keywords.filter(kw => {
    const pos = parseInt(kw['Position'] || '0');
    const vol = parseInt(kw['Search Volume'] || '0');
    return pos >= 4 && pos <= 10 && vol >= 1000;
  });
  if (almostThereKws.length > 0) {
    const best = almostThereKws.sort((a, b) => parseInt(b['Search Volume'] || '0') - parseInt(a['Search Volume'] || '0'))[0];
    const kw = best['Keyword'];
    const pos = best['Position'];
    const vol = parseInt(best['Search Volume'] || '0').toLocaleString();
    priorities.push({
      icon: '🎯',
      title: `Push "${kw}" into Top 3`,
      description: `Currently #${pos} with ${vol} monthly searches. Refresh the content, add internal links, and build 2-3 backlinks to this page. Moving to top 3 could 2-3x your traffic from this keyword alone.`,
      impact: 'high',
      score: 95,
    });
  }

  // Authority score analysis
  if (data.authorityScore < 40) {
    priorities.push({
      icon: '🔗',
      title: 'Build Domain Authority (Currently ' + data.authorityScore + ')',
      description: `Your authority score of ${data.authorityScore} is below the competitive threshold of 40+. Focus on earning backlinks from local news sites, real estate publications, and community organizations. Guest posts and local PR are the fastest path.`,
      impact: 'high',
      score: 90,
    });
  } else if (data.authorityScore < 50) {
    priorities.push({
      icon: '🔗',
      title: 'Push Authority Score Past 50',
      description: `At ${data.authorityScore}, you're competitive but not dominant. Target high-authority backlinks from industry publications (Inman, HousingWire) and local media. Each point above 40 has outsized impact on rankings.`,
      impact: 'medium',
      score: 75,
    });
  }

  // Backlink-to-referring-domain ratio
  if (data.referringDomains > 0) {
    const ratio = data.totalBacklinks / data.referringDomains;
    if (ratio > 8) {
      priorities.push({
        icon: '🌐',
        title: 'Diversify Your Backlink Sources',
        description: `You have ${data.totalBacklinks.toLocaleString()} backlinks from only ${data.referringDomains.toLocaleString()} domains (${ratio.toFixed(0)}:1 ratio). Focus on getting links from NEW domains rather than more links from existing ones. Diverse sources signal stronger authority to Google.`,
        impact: 'medium',
        score: 70,
      });
    }
  }

  // High-CPC keywords = money keywords
  const highCpcKws = data.keywords.filter(kw => parseFloat(kw['CPC'] || '0') >= 2.0);
  if (highCpcKws.length > 0) {
    const best = highCpcKws[0];
    const cpc = parseFloat(best['CPC'] || '0').toFixed(2);
    priorities.push({
      icon: '💰',
      title: `Capitalize on High-Value Keyword: "${best['Keyword']}"`,
      description: `This keyword has a $${cpc} CPC — advertisers pay real money for this traffic. Make sure this page has a strong call-to-action, lead capture form, and is optimized for conversions. You're getting this traffic for free that others pay $${cpc}/click for.`,
      impact: 'high',
      score: 85,
    });
  }

  // Content opportunity — if traffic is concentrated
  const topKwTraffic = data.keywords.slice(0, 3).reduce((sum, kw) => sum + parseFloat(kw['Traffic (%)'] || '0'), 0);
  if (topKwTraffic > 50) {
    priorities.push({
      icon: '📝',
      title: 'Reduce Traffic Concentration Risk',
      description: `Your top 3 keywords drive ${topKwTraffic.toFixed(0)}% of organic traffic. If any of these drop in rankings, you'll feel it hard. Create more content targeting mid-volume keywords (500-5K searches) to diversify your traffic sources.`,
      impact: 'medium',
      score: 65,
    });
  }

  // Low keyword utilization
  if (data.organicKeywords > 50000 && data.organicTraffic < 50000) {
    priorities.push({
      icon: '📊',
      title: 'Improve Keyword-to-Traffic Conversion',
      description: `You rank for ${data.organicKeywords.toLocaleString()} keywords but only get ${data.organicTraffic.toLocaleString()} monthly visits. Many of your rankings are likely on page 2+. Identify keywords ranking #11-20 and optimize those pages — getting them to page 1 is the fastest traffic win.`,
      impact: 'high',
      score: 88,
    });
  }

  // Sort by score and return top 3
  return priorities
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, ...rest }) => rest);
}

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain') || 'foxessellfaster.com';

  try {
    // Parallel API calls
    const [ranksText, organicText, backlinksText] = await Promise.all([
      fetchSemrush(`${SEMRUSH_BASE}?type=domain_ranks&key=${SEMRUSH_API_KEY}&export_columns=Dn,Rk,Or,Ot,Oc,Ad,At,Ac&domain=${domain}&database=us`),
      fetchSemrush(`${SEMRUSH_BASE}?type=domain_organic&key=${SEMRUSH_API_KEY}&export_columns=Ph,Po,Nq,Cp,Ur,Tr&domain=${domain}&database=us&display_limit=10&display_sort=tr_desc`),
      fetchSemrush(`${SEMRUSH_BACKLINKS}?type=backlinks_overview&key=${SEMRUSH_API_KEY}&target=${domain}&export_columns=total,domains_num,urls_num,score&target_type=root_domain`),
    ]);

    const ranks = parseSemrushCSV(ranksText)[0];
    const keywords = parseSemrushCSV(organicText);
    const backlinks = parseSemrushCSV(backlinksText)[0];

    if (!ranks) {
      return NextResponse.json({ error: 'No domain data returned from SemRush' }, { status: 502 });
    }

    const organicTraffic = parseInt(ranks['Organic Traffic'] || '0');
    const organicKeywords = parseInt(ranks['Organic Keywords'] || '0');
    const totalBacklinks = backlinks ? parseInt(backlinks['total'] || '0') : 0;
    const referringDomains = backlinks ? parseInt(backlinks['domains_num'] || '0') : 0;
    const authorityScore = backlinks ? parseInt(backlinks['score'] || '0') : 0;

    const report = {
      domain,
      reportDate: new Date().toISOString(),
      dataSource: 'semrush_live',
      authorityScore,
      organicTraffic,
      trafficChange: 0, // Requires historical data; current snapshot only
      organicKeywords,
      keywordsChange: 0,
      backlinks: totalBacklinks,
      backlinksChange: 0,
      referringDomains,
      trafficCost: parseInt(ranks['Organic Cost'] || '0'),
      semrushRank: parseInt(ranks['Rank'] || '0'),
      aiVisibilityScore: null as number | null, // Not available via SemRush API
      aiMentions: null as number | null,
      topKeywords: keywords.map(kw => {
        const trafficPct = parseFloat(kw['Traffic (%)'] || '0');
        const estimatedTraffic = Math.round((trafficPct / 100) * organicTraffic);
        return {
          keyword: kw['Keyword'] || '',
          position: parseInt(kw['Position'] || '0'),
          traffic: estimatedTraffic,
          trafficPct,
          volume: parseInt(kw['Search Volume'] || '0'),
          change: 0,
          cpc: parseFloat(kw['CPC'] || '0'),
          url: kw['Url'] || '',
        };
      }),
      trafficChannels: null as { direct: number; ai: number; organic: number; referral: number } | null,
      weeklyHistory: [] as { week: string; organicTraffic: number; organicKeywords: number }[],
      priorities: generatePriorities({ authorityScore, organicTraffic, organicKeywords, totalBacklinks, referringDomains, keywords, domain }),
    };

    return NextResponse.json(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `SemRush API failed: ${message}` }, { status: 502 });
  }
}
