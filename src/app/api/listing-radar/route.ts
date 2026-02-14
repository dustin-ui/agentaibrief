import { NextRequest, NextResponse } from 'next/server';

interface Signal {
  type: string;
  emoji: string;
  description: string;
  date: string;
  source: string;
}

interface PropertyResult {
  address: string;
  city: string;
  state: string;
  zip: string;
  signals: Signal[];
  signalStrength: number;
  estimatedEquity: number;
  mortgageRate: number;
  ownerName: string;
  yearsOwned: number;
  suggestedAction: string;
  suggestedScript: string;
  daysSinceSignal: number;
}

const SIGNAL_TYPES: Record<string, { emoji: string; color: string }> = {
  'building-permit': { emoji: '🔨', color: '#f59e0b' },
  'probate': { emoji: '⚖️', color: '#8b5cf6' },
  'divorce': { emoji: '💔', color: '#ec4899' },
  'pre-foreclosure': { emoji: '⚠️', color: '#ef4444' },
  'expired-listing': { emoji: '📋', color: '#6b7280' },
  'vacancy': { emoji: '🏚️', color: '#78716c' },
  'high-equity': { emoji: '💰', color: '#22c55e' },
  'fsbo': { emoji: '📦', color: '#3b82f6' },
  'investor-flip': { emoji: '🏗️', color: '#f97316' },
  'tax-delinquent': { emoji: '📉', color: '#dc2626' },
};

const SCRIPTS: Record<string, string> = {
  'building-permit': `"Hi [Owner], I'm [Agent] with [Brokerage]. I noticed you recently pulled a building permit — congratulations on the renovation! A lot of homeowners in [Neighborhood] who renovate end up curious what their updated home is worth. I'd love to run a quick equity analysis for you — no strings attached. Would that be helpful?"`,
  'probate': `"Hi, I'm [Agent] with [Brokerage]. I understand this may be a difficult time. I specialize in helping families navigate estate property transitions with care and efficiency. If there's a property that needs attention, I can provide a confidential market analysis and help coordinate everything so you don't have to worry about the details. Would it be helpful to chat briefly?"`,
  'divorce': `"Hi [Owner], I'm [Agent] with [Brokerage]. I work with families going through transitions and understand the importance of handling property matters quickly, fairly, and discreetly. If you're considering your options with your home, I can provide a private valuation and walk you through scenarios. Everything stays completely confidential."`,
  'pre-foreclosure': `"Hi [Owner], I'm [Agent] with [Brokerage]. I wanted to reach out because I may be able to help with your current situation. Many homeowners don't realize they have options — from loan modifications to strategic sales that protect your equity and credit. I've helped several families in [Neighborhood] find solutions. Can I share some options with you?"`,
  'expired-listing': `"Hi [Owner], I noticed your home was on the market previously. I know that can be frustrating. I've been studying what's selling in [Neighborhood] right now, and I have some specific ideas on positioning, pricing, and marketing that I think could make a real difference. Would you be open to a fresh perspective?"`,
  'vacancy': `"Hi [Owner], I'm [Agent] with [Brokerage]. I noticed your property at [Address] appears to be vacant. Vacant homes can become costly — maintenance, insurance, liability. I work with many owners in this situation and can help you evaluate whether selling, renting, or another option makes the most sense financially. Want to explore your options?"`,
  'high-equity': `"Hi [Owner], I'm [Agent] with [Brokerage]. With the way [Neighborhood] values have moved, homeowners who bought when rates were higher are sitting on significant equity — often more than they realize. I put together a complimentary equity report for your property and the numbers are impressive. Would you like to see it?"`,
  'fsbo': `"Hi [Owner], I see you're selling your home — great property! I help FSBO sellers all the time, and I wanted to offer something: I can run a comparative market analysis and share my professional marketing plan at no cost. If you decide you want help, great. If not, at least you'll have the data. Fair enough?"`,
  'investor-flip': `"Hi [Owner], I'm [Agent] with [Brokerage]. I noticed you've been doing some work on your property at [Address] — looks like a great project. When you're ready to list, I specialize in marketing renovated homes to get top dollar. I have a network of qualified buyers specifically looking for updated homes in [Neighborhood]. Want to connect when you're closer to completion?"`,
  'tax-delinquent': `"Hi [Owner], I'm [Agent] with [Brokerage]. I wanted to reach out because I help homeowners explore their options when property costs become a burden. Sometimes selling and downsizing or relocating can actually put money back in your pocket while resolving outstanding obligations. Would it be worth a quick conversation about your options?"`,
};

function generateDemoData(location: string): PropertyResult[] {
  // Parse location to generate contextually appropriate results
  const loc = location.trim();
  const isZip = /^\d{5}$/.test(loc);
  
  // Generate location-appropriate city/state
  const locationMap: Record<string, { city: string; state: string; zip: string; streets: string[] }> = {
    'default': {
      city: loc.split(',')[0]?.trim() || 'Arlington',
      state: loc.split(',')[1]?.trim()?.replace(/\d/g, '').trim() || 'VA',
      zip: isZip ? loc : '22201',
      streets: ['Oak St', 'Maple Ave', 'Wilson Blvd', 'Washington Blvd', 'Glebe Rd', 'Columbia Pike', 'Lee Hwy', 'Fairfax Dr', 'Clarendon Blvd', 'Henderson Rd', 'Pershing Dr', 'Buchanan St', 'Edison St', 'Frederick St', 'George Mason Dr', 'Harrison St', 'Irving St', 'Jefferson St', 'Kenmore St', 'Lincoln St', 'Monroe St', 'Nelson St', 'Oakland St', 'Pollard St', 'Quinn St', 'Randolph St'],
    },
  };

  const locData = locationMap['default'];
  const signalKeys = Object.keys(SIGNAL_TYPES);
  const firstNames = ['James', 'Robert', 'Patricia', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'];

  const count = 15 + Math.floor(Math.random() * 11); // 15-25
  const results: PropertyResult[] = [];

  for (let i = 0; i < count; i++) {
    const streetNum = 100 + Math.floor(Math.random() * 9900);
    const street = locData.streets[Math.floor(Math.random() * locData.streets.length)];
    const numSignals = 1 + Math.floor(Math.random() * 3);
    const selectedSignals: Signal[] = [];
    const usedTypes = new Set<string>();

    for (let s = 0; s < numSignals; s++) {
      let key: string;
      do {
        key = signalKeys[Math.floor(Math.random() * signalKeys.length)];
      } while (usedTypes.has(key));
      usedTypes.add(key);

      const daysAgo = 1 + Math.floor(Math.random() * 180);
      const date = new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];
      const sources: Record<string, string> = {
        'building-permit': 'County Permit Records',
        'probate': 'Circuit Court Filings',
        'divorce': 'Circuit Court Filings',
        'pre-foreclosure': 'Public Notice / County Records',
        'expired-listing': 'MLS Data',
        'vacancy': 'USPS / Utility Data',
        'high-equity': 'Property Tax & Mortgage Records',
        'fsbo': 'Zillow / FSBO.com / Craigslist',
        'investor-flip': 'Permit Records + Tax Assessor',
        'tax-delinquent': 'County Tax Records',
      };
      const descriptions: Record<string, string> = {
        'building-permit': `Renovation permit filed for $${(15000 + Math.floor(Math.random() * 85000)).toLocaleString()} — kitchen/bath remodel`,
        'probate': 'Estate filing detected — property likely to transfer or sell',
        'divorce': 'Divorce filing recorded — potential forced sale',
        'pre-foreclosure': 'Notice of Default filed — owner may need quick sale',
        'expired-listing': `Listed at $${(350000 + Math.floor(Math.random() * 450000)).toLocaleString()} — expired after ${30 + Math.floor(Math.random() * 90)} days`,
        'vacancy': 'USPS mail forwarding detected — no current occupant',
        'high-equity': `Est. ${50 + Math.floor(Math.random() * 40)}% equity with ${(5.5 + Math.random() * 2.5).toFixed(1)}% mortgage rate`,
        'fsbo': 'Owner listing detected on Zillow/FSBO — no agent representation',
        'investor-flip': 'Non-homestead property with active renovation permits',
        'tax-delinquent': `${1 + Math.floor(Math.random() * 3)} years delinquent — $${(2000 + Math.floor(Math.random() * 15000)).toLocaleString()} owed`,
      };

      selectedSignals.push({
        type: key,
        emoji: SIGNAL_TYPES[key].emoji,
        description: descriptions[key],
        date,
        source: sources[key],
      });
    }

    const primarySignal = selectedSignals[0].type;
    const daysSinceSignal = Math.floor((Date.now() - new Date(selectedSignals[0].date).getTime()) / 86400000);
    const equity = 50000 + Math.floor(Math.random() * 400000);
    const rate = +(3.0 + Math.random() * 4.5).toFixed(2);
    const yearsOwned = 1 + Math.floor(Math.random() * 25);

    const actions: Record<string, string> = {
      'building-permit': 'Send equity analysis after renovation completion',
      'probate': 'Send condolence letter + estate services package',
      'divorce': 'Offer confidential market valuation',
      'pre-foreclosure': 'Reach out with foreclosure prevention options',
      'expired-listing': 'Present new marketing strategy',
      'vacancy': 'Contact owner about property management or sale',
      'high-equity': 'Share equity report with cash-out scenarios',
      'fsbo': 'Offer complimentary CMA and marketing plan',
      'investor-flip': 'Connect near project completion for listing',
      'tax-delinquent': 'Discuss sale options to resolve tax burden',
    };

    results.push({
      address: `${streetNum} ${street}`,
      city: locData.city,
      state: locData.state,
      zip: locData.zip,
      signals: selectedSignals,
      signalStrength: Math.min(5, numSignals + Math.floor(Math.random() * 3)),
      estimatedEquity: equity,
      mortgageRate: rate,
      ownerName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      yearsOwned,
      suggestedAction: actions[primarySignal],
      suggestedScript: SCRIPTS[primarySignal],
      daysSinceSignal,
    });
  }

  // Sort by signal strength descending
  return results.sort((a, b) => b.signalStrength - a.signalStrength || a.daysSinceSignal - b.daysSinceSignal);
}

export async function POST(request: NextRequest) {
  try {
    const { location, radius, signals } = await request.json();

    if (!location || typeof location !== 'string') {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    let results = generateDemoData(location);

    // Filter by signal types if specified
    if (signals && Array.isArray(signals) && signals.length > 0) {
      results = results.filter((r) =>
        r.signals.some((s) => signals.includes(s.type))
      );
    }

    return NextResponse.json({
      location,
      radius: radius || 5,
      resultCount: results.length,
      dataSource: 'ai-enhanced' as const,
      dataSources: {
        connected: ['AI-Enhanced Demo Data'],
        comingSoon: ['ATTOM Data API', 'County Records API', 'MLS IDX Feed', 'USPS Vacancy Data', 'Court Records API'],
      },
      results,
    });
  } catch (err) {
    console.error('Listing radar error:', err);
    return NextResponse.json({ error: 'Failed to generate radar results' }, { status: 500 });
  }
}
