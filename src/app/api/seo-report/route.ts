import { NextRequest, NextResponse } from 'next/server';

const SEMRUSH_API_KEY = process.env.SEMRUSH_API_KEY || 'a3fc492f4f3f6d6066f46f457f2bf02b';
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

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain') || 'foxessellfaster.com';

  try {
    // Parallel API calls
    const [ranksText, organicText, backlinksText] = await Promise.all([
      fetchSemrush(`${SEMRUSH_BASE}?type=domain_ranks&key=${SEMRUSH_API_KEY}&export_columns=Dn,Rk,Or,Ot,Oc,Ad,At,Ac&domain=${domain}&database=us`),
      fetchSemrush(`${SEMRUSH_BASE}?type=domain_organic&key=${SEMRUSH_API_KEY}&export_columns=Ph,Po,Nq,Cp,Ur,Tr&domain=${domain}&database=us&display_limit=10&display_sort=tr_desc`),
      fetchSemrush(`${SEMRUSH_BACKLINKS}?type=backlinks_overview&key=${SEMRUSH_API_KEY}&target=${domain}&export_columns=total,domains_num,urls_num&target_type=root_domain`),
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

    const report = {
      domain,
      reportDate: new Date().toISOString(),
      dataSource: 'semrush_live',
      authorityScore: 0, // Not available via basic API — use SemRush dashboard for this metric
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
      topKeywords: keywords.map(kw => ({
        keyword: kw['Keyword'] || '',
        position: parseInt(kw['Position'] || '0'),
        traffic: parseFloat(kw['Traffic (%)'] || '0'),
        volume: parseInt(kw['Search Volume'] || '0'),
        change: 0, // Requires historical data
        cpc: parseFloat(kw['CPC'] || '0'),
        url: kw['Url'] || '',
      })),
      trafficChannels: null as { direct: number; ai: number; organic: number; referral: number } | null, // Not available via API
      weeklyHistory: [] as { week: string; organicTraffic: number; organicKeywords: number }[],
    };

    return NextResponse.json(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `SemRush API failed: ${message}` }, { status: 502 });
  }
}
