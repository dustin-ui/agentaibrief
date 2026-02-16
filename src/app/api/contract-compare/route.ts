import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const COMPARISON_PROMPT = `You are a real estate contract comparison expert. Analyze this contract and extract the following fields into a JSON object.

Return ONLY valid JSON with these exact fields (use null for anything not found):

{
  "propertyAddress": "string or null",
  "purchasePrice": "number or null (just the number, no $ or commas)",
  "purchasePriceFormatted": "string like $725,000",
  "earnestMoneyDeposit": "number or null",
  "earnestMoneyDepositFormatted": "string like $25,000",
  "financingType": "string (Conventional, FHA, VA, Cash, USDA, etc.) or null",
  "amountFinanced": "string or null",
  "downPayment": "string or null",
  "sellerPaidBuyerAgency": "string or null",
  "sellerPaidBuyerAgencyAmount": "number or null",
  "sellerConcessions": "string or null",
  "sellerConcessionsAmount": "number or null",
  "closingDate": "string or null",
  "financingContingency": "string description or null",
  "financingContingencyDays": "number or null",
  "appraisalContingency": "string description or null",
  "appraisalContingencyDays": "number or null",
  "homeInspection": "string description or null",
  "homeInspectionDays": "number or null",
  "hoaContingency": "string or null",
  "escalationClause": {
    "present": true/false,
    "increment": "string or null",
    "maxEscalation": "string or null",
    "maxEscalationAmount": "number or null",
    "details": "string or null"
  },
  "wdiInspection": "string or null",
  "appraisalGap": "string or null",
  "septicWell": "string or null",
  "septicPaidBy": "string or null",
  "radon": "string or null",
  "lender": "string or null",
  "titleCompany": "string or null",
  "buyerName": "string or null",
  "buyerAgentName": "string or null",
  "rentBack": "string or null",
  "notes": "string or null - any other notable terms",
  "allDatesAndDeadlines": [
    {"event": "string", "date": "string", "daysFromNow": "number or null"}
  ]
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

// Extract text/content blocks from a file buffer
async function extractContentFromBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<Anthropic.Messages.ContentBlockParam[]> {
  const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];

  if (mimeType === 'application/pdf') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    try {
      const pdfData = await pdfParse(buffer);
      if (pdfData.text && pdfData.text.trim().length > 100) {
        contentBlocks.push({ type: 'text', text: `Contract text from "${fileName}":\n\n${pdfData.text}` });
      } else {
        // PDF has no extractable text (likely scanned) - send as document
        contentBlocks.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: buffer.toString('base64') },
        } as Anthropic.Messages.ContentBlockParam);
      }
    } catch {
      // If pdf-parse fails, try sending as base64 document
      contentBlocks.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: buffer.toString('base64') },
      } as Anthropic.Messages.ContentBlockParam);
    }
  } else if (mimeType.startsWith('image/')) {
    contentBlocks.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        data: buffer.toString('base64'),
      },
    });
  }

  return contentBlocks;
}

// Fetch file from URL and return buffer + mime type
async function fetchFileFromUrl(url: string): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Get mime type from response or infer from URL
  let mimeType = response.headers.get('content-type') || '';
  if (mimeType.includes(';')) {
    mimeType = mimeType.split(';')[0].trim();
  }
  
  // Fallback: infer from URL extension
  if (!mimeType || mimeType === 'application/octet-stream') {
    const urlPath = new URL(url).pathname.toLowerCase();
    if (urlPath.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (urlPath.endsWith('.jpg') || urlPath.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (urlPath.endsWith('.png')) mimeType = 'image/png';
    else if (urlPath.endsWith('.gif')) mimeType = 'image/gif';
    else if (urlPath.endsWith('.webp')) mimeType = 'image/webp';
  }
  
  // Extract filename from URL
  const fileName = decodeURIComponent(url.split('/').pop() || 'document');
  
  return { buffer, mimeType, fileName };
}

// Extract text from a File object (for FormData requests)
async function extractTextFromFile(file: File): Promise<{ contentBlocks: Anthropic.Messages.ContentBlockParam[] }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentBlocks = await extractContentFromBuffer(buffer, file.type, file.name);
  return { contentBlocks };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const contentType = req.headers.get('content-type') || '';
    const client = new Anthropic({ apiKey });

    // Handle JSON request (with file URLs from Supabase Storage)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      
      // Handle summary-only request
      if (body.summarize && body.offers) {
        const comparisonInput = body.offers.map((o: { label: string; data: Record<string, unknown> }) => ({
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

        try {
          return NextResponse.json({ comparison: JSON.parse(summaryText) });
        } catch {
          return NextResponse.json({ comparison: null });
        }
      }

      // Handle offers with file URLs
      const { address, offers: offerInputs } = body as {
        address: string;
        offers: Array<{ label: string; fileUrls: string[] }>;
      };

      if (!offerInputs || offerInputs.length === 0) {
        return NextResponse.json({ error: 'No offers provided' }, { status: 400 });
      }

      const offers: Array<{ label: string; fileName: string; data: Record<string, unknown> | null; error?: string }> = [];

      for (const offerInput of offerInputs) {
        const { label, fileUrls } = offerInput;
        
        if (!fileUrls || fileUrls.length === 0) {
          offers.push({ label, fileName: '', data: null, error: 'No files provided for this offer' });
          continue;
        }

        try {
          // Collect all content blocks from all files in this offer
          const allContentBlocks: Anthropic.Messages.ContentBlockParam[] = [];
          const fileNames: string[] = [];

          for (const url of fileUrls) {
            try {
              const { buffer, mimeType, fileName } = await fetchFileFromUrl(url);
              const blocks = await extractContentFromBuffer(buffer, mimeType, fileName);
              allContentBlocks.push(...blocks);
              fileNames.push(fileName);
            } catch (fetchErr) {
              console.error(`Failed to fetch file from ${url}:`, fetchErr);
              // Continue with other files
            }
          }

          if (allContentBlocks.length === 0) {
            offers.push({ label, fileName: fileNames.join(', ') || 'unknown', data: null, error: 'Could not extract content from files' });
            continue;
          }

          // Add the extraction prompt
          allContentBlocks.push({
            type: 'text',
            text: COMPARISON_PROMPT + (address ? `\n\nProperty address: ${address}` : ''),
          });

          const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: [{ role: 'user', content: allContentBlocks }],
          });

          const text = response.content
            .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
            .map((b) => b.text)
            .join('');

          try {
            // Try to parse JSON, handling potential markdown fences
            let jsonText = text.trim();
            if (jsonText.startsWith('```')) {
              jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
            }
            offers.push({ label, fileName: fileNames.join(', '), data: JSON.parse(jsonText) });
          } catch {
            console.error('Failed to parse AI response:', text.slice(0, 500));
            offers.push({ label, fileName: fileNames.join(', '), data: null, error: 'Failed to parse AI response' });
          }
        } catch (err) {
          console.error('Offer processing error:', err);
          offers.push({ label, fileName: '', data: null, error: String(err) });
        }
      }

      return NextResponse.json({ address, offers, comparison: null });
    }

    // Handle FormData request (legacy - direct file uploads)
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
