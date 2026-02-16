import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const EXTRACTION_PROMPT = `You are a real estate contract analyzer. Extract ALL terms and contingencies from this contract into a structured JSON format.

Return a JSON object with these fields (use null for anything not found):

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
  "otherTerms": ["any other notable terms not captured above"]
}

Return ONLY valid JSON, no markdown fences.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const address = formData.get('address') as string;

    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });
    const results = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];

      if (file.type === 'application/pdf') {
        // Use pdf-parse v2 for PDF text extraction
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PDFParse } = require('pdf-parse');
        try {
          const parser = new PDFParse({ data: buffer });
          const result = await parser.getText();
          const text = result.text || '';
          
          if (text.trim().length > 100) {
            contentBlocks.push({
              type: 'text',
              text: `Contract text from PDF "${file.name}":\n\n${text}`,
            });
          } else {
            // PDF has no extractable text - send as document
            contentBlocks.push({
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: buffer.toString('base64'),
              },
            } as Anthropic.Messages.ContentBlockParam);
          }
        } catch {
          // If pdf-parse fails, try sending as base64 document
          contentBlocks.push({
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: buffer.toString('base64'),
            },
          } as Anthropic.Messages.ContentBlockParam);
        }
      } else if (file.type.startsWith('image/')) {
        const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
        contentBlocks.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: buffer.toString('base64'),
          },
        });
      }

      contentBlocks.push({
        type: 'text',
        text: EXTRACTION_PROMPT + (address ? `\n\nProperty address: ${address}` : ''),
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
        const parsed = JSON.parse(text);
        results.push({ fileName: file.name, data: parsed });
      } catch {
        results.push({ fileName: file.name, data: null, rawText: text, error: 'Failed to parse response' });
      }
    }

    return NextResponse.json({ address, results });
  } catch (error) {
    console.error('Contract analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
