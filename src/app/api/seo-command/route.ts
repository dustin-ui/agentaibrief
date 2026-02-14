import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { businessName, city, state, keyword } = await req.json();
    if (!businessName || !city) {
      return NextResponse.json({ error: 'Business name and city are required' }, { status: 400 });
    }

    const now = new Date();
    const monthName = now.toLocaleString('en-US', { month: 'long' });
    const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' });
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const searchKeyword = keyword || `${businessName} ${city}`;

    // Generate prescriptive top actions
    const topActions = [
      {
        id: 1,
        title: `Post a Google Business update about ${monthName} in ${city}`,
        why: `GBP posts with local + seasonal relevance get 2.3x more views. ${dayOfWeek}s between 10am-1pm get peak engagement.`,
        impact: 'high' as const,
        timeMinutes: 5,
        preWrittenCopy: `🏡 ${monthName} Market Update in ${city}, ${state || ''}\n\nThinking about buying or selling this ${monthName.toLowerCase()}? Here's what you need to know about the ${city} market right now.\n\n${monthName} is historically one of the best months for real estate activity in the area. Reach out today for a free home valuation!\n\n📞 Contact us today\n#${city.replace(/\s+/g, '')}RealEstate #${monthName}Market #HomeValue`,
        done: false,
      },
      {
        id: 2,
        title: 'Reply to your 3 most recent Google reviews',
        why: 'Review response rate is a top-5 local ranking factor. Google rewards businesses that respond within 24 hours. Only 36% of agents respond to reviews.',
        impact: 'high' as const,
        timeMinutes: 10,
        preWrittenCopy: `Thank you so much for the kind words! It was a pleasure helping you navigate the ${city} real estate market. Your trust means everything to us. If you ever need anything in the future, don't hesitate to reach out! ⭐`,
        done: false,
      },
      {
        id: 3,
        title: `Add 5 new photos of ${city} neighborhoods to your GBP`,
        why: 'Listings with 100+ photos get 520% more calls and 2,717% more direction requests. Most agents have fewer than 20 photos.',
        impact: 'medium' as const,
        timeMinutes: 15,
        preWrittenCopy: `Take photos of: local landmarks, your "Sold" signs, neighborhood streetscapes, popular restaurants/shops, and community events. Label each photo with "${city}" in the filename for extra SEO value.`,
        done: false,
      },
    ];

    // Generate simulated grid data (7x7 grid)
    const gridSize = 7;
    const centerLat = 38.9;
    const centerLng = -77.04;
    const radiusMiles = 5;
    const latStep = (radiusMiles / 69) * 2 / (gridSize - 1);
    const lngStep = (radiusMiles / 54.6) * 2 / (gridSize - 1);

    const gridData: Array<{
      row: number; col: number; lat: number; lng: number;
      ranking: number | null; topCompetitors: string[];
    }> = [];

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const dist = Math.sqrt(Math.pow(r - 3, 2) + Math.pow(c - 3, 2));
        let ranking: number | null;
        if (dist < 1.5) ranking = Math.floor(Math.random() * 3) + 1;
        else if (dist < 2.5) ranking = Math.floor(Math.random() * 7) + 2;
        else if (dist < 3.5) ranking = Math.floor(Math.random() * 12) + 5;
        else ranking = Math.random() > 0.3 ? Math.floor(Math.random() * 15) + 8 : null;

        gridData.push({
          row: r, col: c,
          lat: centerLat + (3 - r) * latStep,
          lng: centerLng + (c - 3) * lngStep,
          ranking,
          topCompetitors: [
            `${city} Premier Realty`,
            `Keller Williams ${city}`,
            `RE/MAX ${city}`,
          ].slice(0, ranking && ranking > 3 ? 3 : 1),
        });
      }
    }

    // Generate audit data
    const audit = {
      gbpScore: Math.floor(Math.random() * 25) + 55,
      gbpIssues: [
        { item: 'Business description', status: 'missing' as const, fix: 'Add a 750-character keyword-rich description mentioning ' + city },
        { item: 'Business hours', status: 'incomplete' as const, fix: 'Add special hours for holidays' },
        { item: 'Service areas', status: 'ok' as const, fix: null },
        { item: 'Business categories', status: 'needs_improvement' as const, fix: `Add secondary categories: "Real Estate Consultant", "Property Management"` },
        { item: 'Products/Services', status: 'missing' as const, fix: 'Add at least 5 services (Buyer Representation, Listing Agent, etc.)' },
        { item: 'Q&A section', status: 'empty' as const, fix: 'Seed with 10 common questions + answers to control the narrative' },
        { item: 'Photo count', status: 'needs_improvement' as const, fix: 'You have ~25 photos. Top competitors average 85+. Add 60 more.' },
        { item: 'Post frequency', status: 'needs_improvement' as const, fix: 'Post at least weekly. Top agents post 3-4x/week.' },
      ],
      citations: [
        { directory: 'Yelp', status: 'consistent' as const, url: 'https://biz.yelp.com' },
        { directory: 'Zillow', status: 'inconsistent' as const, issue: 'Phone number mismatch', url: 'https://www.zillow.com/agent-finder/' },
        { directory: 'Realtor.com', status: 'missing' as const, url: 'https://www.realtor.com/realestateagents/' },
        { directory: 'Facebook', status: 'consistent' as const, url: 'https://business.facebook.com' },
        { directory: 'Homes.com', status: 'missing' as const, url: 'https://www.homes.com' },
        { directory: 'Nextdoor', status: 'inconsistent' as const, issue: 'Address mismatch', url: 'https://nextdoor.com/pages/' },
        { directory: 'BBB', status: 'missing' as const, url: 'https://www.bbb.org' },
        { directory: 'Apple Maps', status: 'consistent' as const, url: 'https://mapsconnect.apple.com' },
        { directory: 'Bing Places', status: 'missing' as const, url: 'https://www.bingplaces.com' },
        { directory: 'Yellow Pages', status: 'consistent' as const, url: 'https://www.yellowpages.com' },
      ],
      reviews: {
        yourCount: Math.floor(Math.random() * 40) + 15,
        yourRating: (4 + Math.random() * 0.8).toFixed(1),
        competitors: [
          { name: `${city} Premier Realty`, count: Math.floor(Math.random() * 60) + 80, rating: '4.9' },
          { name: `Keller Williams ${city}`, count: Math.floor(Math.random() * 40) + 60, rating: '4.7' },
          { name: `RE/MAX ${city}`, count: Math.floor(Math.random() * 30) + 50, rating: '4.6' },
        ],
        monthlyVelocity: [
          { month: 'Sep', you: 3, competitor: 8 },
          { month: 'Oct', you: 2, competitor: 7 },
          { month: 'Nov', you: 4, competitor: 9 },
          { month: 'Dec', you: 1, competitor: 6 },
          { month: 'Jan', you: 3, competitor: 10 },
          { month: monthName.substring(0, 3), you: 1, competitor: 5 },
        ],
        reviewsNeeded: Math.floor(Math.random() * 8) + 4,
      },
      generatedAt: dateStr,
    };

    return NextResponse.json({ topActions, gridData, audit, keyword: searchKeyword });
  } catch (err: unknown) {
    console.error('SEO Command error:', err);
    return NextResponse.json({ error: 'Failed to generate SEO analysis' }, { status: 500 });
  }
}
