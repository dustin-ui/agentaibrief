import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain') || 'foxessellfaster.com';

  // Mock data — will wire up real SemRush scraping later
  const report = {
    domain,
    reportDate: new Date().toISOString(),
    authorityScore: 42,
    organicTraffic: 8743,
    trafficChange: 12.4,
    organicKeywords: 1847,
    keywordsChange: 8.2,
    backlinks: 3291,
    backlinksChange: 5.1,
    aiVisibilityScore: 67,
    aiMentions: 23,
    topKeywords: [
      { keyword: 'homes for sale northern virginia', position: 3, traffic: 1240, volume: 4400, change: 1 },
      { keyword: 'fox homes team', position: 1, traffic: 890, volume: 1200, change: 0 },
      { keyword: 'best realtor dc metro', position: 7, traffic: 620, volume: 2900, change: 2 },
      { keyword: 'fairfax county real estate', position: 5, traffic: 580, volume: 1800, change: -1 },
      { keyword: 'sell my house fast virginia', position: 4, traffic: 510, volume: 3200, change: 3 },
      { keyword: 'arlington va homes', position: 8, traffic: 440, volume: 1600, change: -2 },
      { keyword: 'loudoun county realtor', position: 6, traffic: 390, volume: 1100, change: 1 },
      { keyword: 'tysons corner real estate agent', position: 2, traffic: 350, volume: 880, change: 0 },
      { keyword: 'nova real estate market 2026', position: 9, traffic: 280, volume: 720, change: 4 },
      { keyword: 'first time home buyer virginia', position: 11, traffic: 210, volume: 2100, change: -3 },
    ],
    trafficChannels: {
      direct: 22,
      ai: 18,
      organic: 47,
      referral: 13,
    },
    weeklyHistory: [
      { week: '2026-01-05', authorityScore: 38, organicTraffic: 7200, organicKeywords: 1620 },
      { week: '2026-01-12', authorityScore: 39, organicTraffic: 7450, organicKeywords: 1680 },
      { week: '2026-01-19', authorityScore: 40, organicTraffic: 7890, organicKeywords: 1720 },
      { week: '2026-01-26', authorityScore: 41, organicTraffic: 8100, organicKeywords: 1780 },
      { week: '2026-02-02', authorityScore: 42, organicTraffic: 8743, organicKeywords: 1847 },
    ],
  };

  return NextResponse.json(report);
}
