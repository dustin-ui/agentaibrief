import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 120;

function buildExtractionPrompt(fields: string[]): string {
  // For single analysis, use detailed extraction regardless of fields
  // But if fields are provided, focus on those
  const hasFields = fields.length > 0;

  const basePrompt = `You are a real estate contract analyzer. Extract ALL terms and contingencies from this contract into a structured JSON format.

Return ONLY valid JSON (no markdown fences) with these fields (use null for anything not found):

{
  "closingDate": "string or null",
  "settlementCompany": "string or null",
  "purchasePrice": "string or null",
  "financingType": "string (Conventional, FHA, VA, Cash, etc.) or null",
  "loanAmount": "string or null",
  "downPayment": "string or null",
  "interestRate": "string or null",
  "earnestMoney": {
    "amount": "string or null",
    "dueDate": "string or null",
    "heldBy": "string or null"
  },
  "contingencies": [
    {
      "type": "string (e.g. Home Inspection, Appraisal, Financing, Radon, Lead Paint, Well/Septic, HOA, Sale of Buyer's Property, etc.)",
      "deadline": "string or null",
      "details": "string"
    }
  ],
  "sellerConcessions": "string or null",
  "personalProperty": ["list of included items"],
  "escalationClause": {
    "present": false,
    "maxPrice": "string or null",
    "increment": "string or null",
    "details": "string or null"
  },
  "addenda": ["list of non-standard addenda or riders"],
  "parties": {
    "buyer": "string or null",
    "seller": "string or null",
    "buyerAgent": "string or null",
    "sellerAgent": "string or null",
    "buyerBrokerage": "string or null",
    "sellerBrokerage": "string or null",
    "lender": "string or null",
    "titleCompany": "string or null"
  },
  "possessionDate": "string or null",
  "homeWarranty": {
    "included": false,
    "provider": "string or null",
    "cost": "string or null",
    "paidBy": "string or null"
  },
  "otherTerms": ["any other notable terms not captured above"]`;

  if (hasFields) {
    const customFields = fields.filter(f => {
      const known = ['Purchase Price', 'Earnest Money Deposit', 'Financing Type', 'Amount Financed',
        'Down Payment', 'Seller Paid Buyer Agency', 'Seller Concessions', 'Closing Date',
        'Financing Contingency', 'Appraisal Contingency', 'Home Inspection', 'HOA',
        'Escalation', 'Escalation Increments', 'Max Escalation', 'WDI', 'Appraisal Gap',
        'Septic/Well', 'Septic Paid By', 'Radon', 'Lender', 'Title Company',
        'Buyer Name', 'Buyer Agent Name', 'Rent Back'];
      return !known.includes(f);
    });

    if (customFields.length > 0) {
      const customSection = customFields.map(cf => {
        const key = cf.charAt(0).toLowerCase() + cf.slice(1).replace(/[^a-zA-Z0-9]/g, '');
        return `  "${key}": "string or null (${cf} details)"`;
      }).join(',\n');
      return basePrompt + `,\n${customSection}\n}\n\nReturn ONLY valid JSON, no markdown fences.`;
    }
  }

  return basePrompt + `\n}\n\nReturn ONLY valid JSON, no markdown fences.`;
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const address = formData.get('address') as string;

    // Parse selected fields
    let fields: string[];
    try {
      fields = JSON.parse(formData.get('fields') as string || '[]');
    } catch {
      fields = [];
    }
    const extractionPrompt = buildExtractionPrompt(fields);

    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];

      if (file.type === 'application/pdf') {
        contentBlocks.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: buffer.toString('base64') },
        } as Anthropic.Messages.ContentBlockParam);
      } else if (file.type.startsWith('image/')) {
        contentBlocks.push({
          type: 'image',
          source: { type: 'base64', media_type: file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: buffer.toString('base64') },
        });
      }

      contentBlocks.push({
        type: 'text',
        text: extractionPrompt + (address ? `\n\nProperty address: ${address}` : ''),
      });

      try {
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
          const parsed = JSON.parse(cleanJsonResponse(text));
          results.push({ fileName: file.name, data: parsed });
        } catch {
          results.push({ fileName: file.name, data: null, rawText: text.slice(0, 500), error: 'Failed to parse response' });
        }
      } catch (err) {
        results.push({ fileName: file.name, data: null, error: String(err).slice(0, 300) });
      }
    }

    return NextResponse.json({ address, results });
  } catch (error) {
    console.error('Contract analysis error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Analysis failed: ${message}` }, { status: 500 });
  }
}
