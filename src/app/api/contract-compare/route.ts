import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const COMPARISON_PROMPT = `You are a real estate contract comparison expert. Analyze this contract and extract the following fields into a JSON object.

Return ONLY valid JSON with these exact fields (use null for anything not found):

{
  "purchasePrice": "number or null (just the number, no $ or commas)",
  "purchasePriceFormatted": "string like $725,000",
  "earnestMoney": "number or null",
  "earnestMoneyFormatted": "string",
  "escalationClause": {
    "present": true/false,
    "cap": "string or null",
    "increment": "string or null",
    "details": "string or null"
  },
  "financingType": "string (Conventional, FHA, VA, Cash, USDA, etc.) or null",
  "downPaymentPercent": "string or null",
  "closingDate": "string or null",
  "closingDaysFromNow": "number or null (estimated days)",
  "settlementCompany": "string or null",
  "inspectionContingencyDays": "number or null",
  "financingContingencyDays": "number or null",
  "appraisalContingency": {
    "present": true/false,
    "gapCoverage": "string or null"
  },
  "homeSaleContingency": true/false,
  "sellerConcessions": "string or null",
  "sellerConcessionsAmount": "number or null",
  "personalProperty": ["list of items"],
  "postSettlementOccupancy": "string or null",
  "unusualClauses": ["list of unusual terms or addendums"],
  "buyerName": "string or null",
  "allDatesAndDeadlines": [
    {"event": "string", "date": "string", "daysFromNow": "number or null"}
  ],
  "riskFlags": ["list of concerning terms for the seller"]
}

Return ONLY valid JSON, no markdown fences.`;

const SUMMARY_PROMPT = `You are a real estate expert helping a listing agent compare multiple offers. Given the structured comparison data below, provide:

1. "summary": An array of 3-5 bullet points comparing the offers in plain language. Be specific with numbers. Example: "Offer A is $15,000 higher but has a home sale contingency that adds risk."
2. "bestOffer": Which offer label (e.g. "Offer A") is strongest for the SELLER and why (2-3 sentences)
3. "riskAnalysis": Array of objects with "offer" (label) and "risks" (array of specific risk descriptions)

Consider: price, contingencies, financing strength, closing timeline, concessions, and overall deal certainty.

Return ONLY valid JSON:
{
  "summary": ["bullet 1", "bullet 2", ...],
  "bestOffer": { "label": "Offer X", "reasoning": "..." },
  "riskAnalysis": [{"offer": "Offer A", "risks": ["risk 1", ...]}, ...]
}`;

async function extractTextFromFile(file: File): Promise<{ contentBlocks: Anthropic.Messages.ContentBlockParam[] }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];

  if (file.type === 'application/pdf') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    try {
      const pdfData = await pdfParse(buffer);
      contentBlocks.push({ type: 'text', text: `Contract text:\n\n${pdfData.text}` });
    } catch {
      contentBlocks.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: buffer.toString('base64') },
      } as Anthropic.Messages.ContentBlockParam);
    }
  } else if (file.type.startsWith('image/')) {
    contentBlocks.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        data: buffer.toString('base64'),
      },
    });
  }

  return { contentBlocks };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const address = formData.get('address') as string;
    const labels = (formData.get('labels') as string)?.split(',') || files.map((_, i) => `Offer ${String.fromCharCode(65 + i)}`);

    if (files.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 contracts to compare' }, { status: 400 });
    }
    if (files.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 contracts allowed' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });
    const offers: Array<{ label: string; fileName: string; data: Record<string, unknown> | null; error?: string }> = [];

    // Extract data from each contract
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const label = labels[i] || `Offer ${String.fromCharCode(65 + i)}`;

      try {
        const { contentBlocks } = await extractTextFromFile(file);
        contentBlocks.push({
          type: 'text',
          text: COMPARISON_PROMPT + (address ? `\n\nProperty address: ${address}` : ''),
        });

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [{ role: 'user', content: contentBlocks }],
        });

        const text = response.content
          .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('');

        try {
          offers.push({ label, fileName: file.name, data: JSON.parse(text) });
        } catch {
          offers.push({ label, fileName: file.name, data: null, error: 'Failed to parse AI response' });
        }
      } catch (err) {
        offers.push({ label, fileName: file.name, data: null, error: String(err) });
      }
    }

    // Generate comparison summary
    let comparison = null;
    const validOffers = offers.filter((o) => o.data);
    if (validOffers.length >= 2) {
      try {
        const comparisonInput = validOffers.map((o) => ({
          label: o.label,
          ...o.data,
        }));

        const summaryResponse = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: `${SUMMARY_PROMPT}\n\nOffers data:\n${JSON.stringify(comparisonInput, null, 2)}`,
            },
          ],
        });

        const summaryText = summaryResponse.content
          .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('');

        comparison = JSON.parse(summaryText);
      } catch {
        comparison = null;
      }
    }

    return NextResponse.json({ address, offers, comparison });
  } catch (error) {
    console.error('Contract comparison error:', error);
    return NextResponse.json({ error: 'Comparison failed' }, { status: 500 });
  }
}
