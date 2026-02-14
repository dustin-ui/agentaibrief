import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { city, state } = await req.json();
    if (!city || !state) {
      return NextResponse.json({ error: 'City and state are required' }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const prompt = `You are a real estate market analyst. Provide a comprehensive, data-driven market update for ${city}, ${state} using the most current data available.

Include ALL of the following metrics with actual current numbers:

1. **Median Home Price** - current median sale price
2. **Days on Market (DOM)** - average days listings stay active
3. **Active Inventory** - number of homes currently for sale
4. **Months of Supply** - current inventory divided by monthly sales pace
5. **Year-over-Year Price Change** - percentage change from last year
6. **List-to-Sale Price Ratio** - what percentage of asking price homes sell for
7. **Market Type** - buyer's market, seller's market, or balanced
8. **New Listings** - recent new listing activity
9. **Closed Sales** - recent closed sale volume
10. **Price Per Square Foot** - current median price per sqft

Then provide:
- **Key Market Trends** - 3-5 bullet points on what's driving the market
- **Forecast** - short-term outlook for the next 3-6 months
- **Advice for Sellers** - 2-3 actionable tips
- **Advice for Buyers** - 2-3 actionable tips

Format the response in clean markdown with clear headers and bold metric labels. Use actual numbers from current sources. If exact data isn't available for a metric, provide the best available estimate and note the source timeframe.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      return NextResponse.json({ error: 'No data returned from Gemini' }, { status: 500 });
    }

    return NextResponse.json({ report: text, city, state });
  } catch (err: unknown) {
    console.error('Market update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
