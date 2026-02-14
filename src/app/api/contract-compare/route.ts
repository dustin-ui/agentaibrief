import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 300;

// Field-to-JSON-schema mapping for dynamic prompt building
const FIELD_SCHEMA: Record<string, string> = {
  'Purchase Price': '"purchasePrice": "number or null (just the number, no $ or commas)",\n  "purchasePriceFormatted": "string like $725,000"',
  'Earnest Money Deposit': '"earnestMoneyDeposit": "number or null",\n  "earnestMoneyDepositFormatted": "string like $10,000"',
  'Financing Type': '"financingType": "string (Conventional, FHA, VA, Cash, USDA, etc.) or null"',
  'Amount Financed': '"amountFinanced": "string or null (dollar amount being financed)"',
  'Down Payment': '"downPayment": "string or null (dollar amount or percentage)"',
  'Seller Paid Buyer Agency': '"sellerPaidBuyerAgency": "string or null (dollar amount or percentage the seller pays toward buyer agent commission)",\n  "sellerPaidBuyerAgencyAmount": "number or null (just the number)"',
  'Seller Concessions': '"sellerConcessions": "string or null (dollar amount or details)",\n  "sellerConcessionsAmount": "number or null (just the number)"',
  'Closing Date': '"closingDate": "string or null"',
  'Financing Contingency': '"financingContingency": "string or null (e.g. \'21 days — standard financing contingency\')",\n  "financingContingencyDays": "number or null"',
  'Appraisal Contingency': '"appraisalContingency": "string or null (e.g. \'21 days — waived gap coverage\')",\n  "appraisalContingencyDays": "number or null"',
  'Home Inspection': '"homeInspection": "string or null (e.g. \'10 days — full inspection with right to void\')",\n  "homeInspectionDays": "number or null"',
  'HOA': '"hoaContingency": "string or null"',
  'Escalation': '"escalationClause": {\n    "present": true/false,\n    "increment": "string or null (e.g. \'$5,000\')",\n    "maxEscalation": "string or null (e.g. \'$800,000\')",\n    "maxEscalationAmount": "number or null",\n    "details": "string or null"\n  }',
  'Escalation Increments': '',
  'Max Escalation': '',
  'WDI': '"wdiInspection": "string or null (wood-destroying insect inspection details)"',
  'Appraisal Gap': '"appraisalGap": "string or null (amount buyer will cover if appraisal is low)"',
  'Septic/Well': '"septicWell": "string or null (present/details)"',
  'Septic Paid By': '"septicPaidBy": "string or null (buyer/seller)"',
  'Radon': '"radon": "string or null (testing/mitigation details)"',
  'Lender': '"lender": "string or null"',
  'Title Company': '"titleCompany": "string or null"',
  'Buyer Name': '"buyerName": "string or null"',
  'Buyer Agent Name': '"buyerAgentName": "string or null"',
  'Rent Back': '"rentBack": "string or null (post-settlement occupancy / rent-back details)"',
};

function buildComparisonPrompt(fields: string[]): string {
  const schemaLines: string[] = [];
  schemaLines.push('"propertyAddress": "string — the full property address from the contract, or null"');

  const added = new Set<string>();
  for (const field of fields) {
    const schema = FIELD_SCHEMA[field];
    if (schema && !added.has(schema)) {
      schemaLines.push(schema);
      added.add(schema);
    }
    if ((field === 'Escalation Increments' || field === 'Max Escalation') && FIELD_SCHEMA['Escalation'] && !added.has(FIELD_SCHEMA['Escalation'])) {
      schemaLines.push(FIELD_SCHEMA['Escalation']);
      added.add(FIELD_SCHEMA['Escalation']);
    }
  }

  const knownFields = new Set(Object.keys(FIELD_SCHEMA));
  for (const cf of fields.filter(f => !knownFields.has(f))) {
    const key = cf.charAt(0).toLowerCase() + cf.slice(1).replace(/[^a-zA-Z0-9]/g, '');
    schemaLines.push(`"${key}": "string or null (${cf} details)"`);
  }

  schemaLines.push('"notes": "string or null (anything unusual, notable addendums, or non-standard terms)"');

  // Always include comprehensive date extraction
  schemaLines.push(`"allDatesAndDeadlines": [
    {
      "event": "string — descriptive name of the deadline/milestone",
      "date": "string — either an absolute date like '2026-03-15' OR a relative description like '10 days after ratification'",
      "daysFromRatification": "number or null — if the deadline is X days from ratification, put the number here"
    }
  ]`);

  return `You are a real estate contract comparison expert. You must handle contracts from ANY US state — not just Virginia/Maryland/DC. Different states use different form names, terminology, and contingency structures. Adapt accordingly.

Analyze this contract and extract the following fields into a JSON object.

CRITICAL — READ CAREFULLY: For the "allDatesAndDeadlines" array, you MUST extract EVERY SINGLE date, deadline, and milestone from the ENTIRE contract and ALL addenda/riders. Do NOT skip any. Aim for 15-30+ items. If you return fewer than 10, you are likely missing items.

Virginia/Maryland/DC contracts commonly have these as CHECKBOX FIELDS with "X days" — look for ALL of them:
- Home inspection contingency (often "10 days" or "15 days")
- Financing contingency (often "21 days")  
- Appraisal contingency (often "21 days")
- HOA/Condo document review period
- Wood-destroying insect (WDI) inspection
- Radon testing deadline
- Septic/well inspection deadline
- Lead paint inspection period (often "10 days")
- Earnest money deposit delivery deadline
- Title search/commitment deadline
- Closing/settlement date
- Post-settlement occupancy agreement — start date AND end date (CRITICAL — do not skip this)
- Rent-back period start and end dates
- Possession date/transfer date
- Final walkthrough date
- Loan commitment/approval deadline
- Rate lock expiration
- Survey deadline
- Property/hazard insurance deadline
- Seller disclosure delivery deadline
- Date of offer
- Date of acceptance/ratification
- Any addendum-specific deadlines (post-occupancy addendum, escalation addendum, etc.)
- Contact settlement agent deadline
- Deposit increase deadlines
- Any other dates mentioned ANYWHERE in the contract

IMPORTANT: Many Virginia contracts (NVAR, GCAAR) express contingencies as checkboxes with "_____ days after Date of Ratification." Even if a checkbox just says "10" in a blank, extract it as "10 days after ratification" with daysFromRatification: 10. 

Also check ALL addenda/riders attached to the contract — these often contain post-occupancy dates, escalation deadlines, and other critical milestones.

For each deadline, if the contract states it as "X days after ratification" or "X business days from acceptance", include the daysFromRatification field. If it's a fixed date, include the date field. Include BOTH when available.

Return ONLY valid JSON with these exact fields (use null for anything not found):

{
  ${schemaLines.join(',\n  ')}
}

Return ONLY valid JSON, no markdown fences.`;
}

const SUMMARY_PROMPT = `You are a real estate expert helping a listing agent compare multiple offers on a property. Given the structured comparison data below, provide a VERY brief 2-3 sentence factual summary comparing the offers. Be specific with numbers. No bullet points. No risk analysis. Just the key factual differences like "Offer A is the highest at $X with a Y closing date, while Offer B offers fewer contingencies but at $Z."

Return ONLY valid JSON:
{
  "summary": "A single string with 2-3 sentences max."
}`;

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

    // Handle JSON requests (summary-only OR file-URL-based comparison)
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();

      // Summary-only request
      if (body.summarize && body.offers) {
        const comparisonInput = body.offers.filter((o: Record<string, unknown>) => o.data).map((o: Record<string, unknown>) => ({ label: o.label, ...o.data as Record<string, unknown> }));
        if (comparisonInput.length < 2) {
          return NextResponse.json({ comparison: null });
        }
        try {
          const summaryResponse = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            messages: [{ role: 'user', content: `${SUMMARY_PROMPT}\n\nOffers data:\n${JSON.stringify(comparisonInput, null, 2)}` }],
          });
          const summaryText = summaryResponse.content
            .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
            .map((b) => b.text)
            .join('');
          return NextResponse.json({ comparison: JSON.parse(cleanJsonResponse(summaryText)) });
        } catch {
          return NextResponse.json({ comparison: null });
        }
      }

      // File-URL-based comparison (files uploaded to Supabase Storage)
      if (body.offers && Array.isArray(body.offers) && body.offers[0]?.fileUrls) {
        const address = body.address || '';
        const fields: string[] = body.fields || [];
        const comparisonPrompt = fields.length > 0 ? buildComparisonPrompt(fields) : buildComparisonPrompt(Object.keys(FIELD_SCHEMA));

        // Process ALL offers in parallel
        const offers = await Promise.all(
          body.offers.map(async (offer: { label: string; fileUrls: string[] }) => {
            if (!offer.fileUrls || offer.fileUrls.length === 0) {
              return { label: offer.label, fileName: 'No files', data: null, error: 'No files uploaded' };
            }

            try {
              const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];
              const fileNames: string[] = [];

              // Download each file from Supabase URL in parallel
              const fileBuffers = await Promise.all(
                offer.fileUrls.map(async (url: string) => {
                  const res = await fetch(url);
                  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
                  const buffer = Buffer.from(await res.arrayBuffer());
                  const fileName = decodeURIComponent(url.split('/').pop() || 'file');
                  const ct = res.headers.get('content-type') || (url.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
                  return { buffer, fileName, contentType: ct };
                })
              );

              for (const { buffer, fileName, contentType: ct } of fileBuffers) {
                if (ct.includes('pdf')) {
                  contentBlocks.push({
                    type: 'document',
                    source: { type: 'base64', media_type: 'application/pdf', data: buffer.toString('base64') },
                  } as Anthropic.Messages.ContentBlockParam);
                } else if (ct.startsWith('image/')) {
                  contentBlocks.push({
                    type: 'image',
                    source: { type: 'base64', media_type: ct as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: buffer.toString('base64') },
                  });
                }
                fileNames.push(fileName);
              }

              contentBlocks.push({
                type: 'text',
                text: `${comparisonPrompt}\n\nThis is ${offer.label}. Property address: ${address}\nFiles included: ${fileNames.join(', ')}`,
              });

              const response = await client.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 8192,
                messages: [{ role: 'user', content: contentBlocks }],
              });

              const text = response.content
                .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
                .map((b) => b.text)
                .join('');

              try {
                return { label: offer.label, fileName: fileNames.join(', '), data: JSON.parse(cleanJsonResponse(text)) };
              } catch {
                return { label: offer.label, fileName: fileNames.join(', '), data: null, error: `Failed to parse AI response: ${text.slice(0, 200)}` };
              }
            } catch (err) {
              return { label: offer.label, fileName: 'Error', data: null, error: String(err).slice(0, 300) };
            }
          })
        );

        // Generate comparison summary if 2+ valid offers
        let comparison = null;
        const validOffers = offers.filter((o: { data: unknown }) => o.data);
        if (validOffers.length >= 2) {
          try {
            const comparisonInput = validOffers.map((o: { label: string; data: Record<string, unknown> }) => ({ label: o.label, ...o.data }));
            const summaryResponse = await client.messages.create({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 8192,
              messages: [{ role: 'user', content: `${SUMMARY_PROMPT}\n\nOffers data:\n${JSON.stringify(comparisonInput, null, 2)}` }],
            });
            const summaryText = summaryResponse.content
              .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
              .map((b) => b.text)
              .join('');
            comparison = JSON.parse(cleanJsonResponse(summaryText));
          } catch {
            comparison = null;
          }
        }

        return NextResponse.json({ address, offers, comparison });
      }
    }

    const formData = await req.formData();
    const address = formData.get('address') as string;
    const offerCount = parseInt(formData.get('offerCount') as string || '0', 10);

    // Parse selected fields
    let fields: string[];
    try {
      fields = JSON.parse(formData.get('fields') as string || '[]');
    } catch {
      fields = [];
    }
    const comparisonPrompt = fields.length > 0 ? buildComparisonPrompt(fields) : buildComparisonPrompt(Object.keys(FIELD_SCHEMA));

    let offers: Array<{ label: string; fileName: string; data: Record<string, unknown> | null; error?: string }> = [];

    if (offerCount > 0) {
      // Process all offers in PARALLEL for speed
      const offerPromises = Array.from({ length: offerCount }, async (_, i) => {
        const label = `Offer ${String.fromCharCode(65 + i)}`;
        const offerFiles = formData.getAll(`offer_${i}_files`) as File[];

        if (!offerFiles.length) {
          return { label, fileName: 'No files', data: null, error: 'No files uploaded for this offer' };
        }

        try {
          const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];
          const fileNames: string[] = [];

          for (const file of offerFiles) {
            const buffer = Buffer.from(await file.arrayBuffer());
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
            fileNames.push(file.name);
          }

          contentBlocks.push({
            type: 'text',
            text: `${comparisonPrompt}\n\nThis is ${label}. Property address: ${address}\nFiles included: ${fileNames.join(', ')}`,
          });

          const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8192,
            messages: [{ role: 'user', content: contentBlocks }],
          });

          const text = response.content
            .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
            .map((b) => b.text)
            .join('');

          try {
            return { label, fileName: fileNames.join(', '), data: JSON.parse(cleanJsonResponse(text)) };
          } catch {
            return { label, fileName: fileNames.join(', '), data: null, error: `Failed to parse AI response: ${text.slice(0, 200)}` };
          }
        } catch (err) {
          return { label, fileName: 'Error', data: null, error: String(err).slice(0, 300) };
        }
      });

      offers = await Promise.all(offerPromises);
    } else {
      const files = formData.getAll('files') as File[];
      const labels = (formData.get('labels') as string)?.split(',') || files.map((_, i) => `Offer ${String.fromCharCode(65 + i)}`);

      if (files.length < 1) {
        return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const label = labels[i] || `Offer ${String.fromCharCode(65 + i)}`;

        try {
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
            text: comparisonPrompt + (address ? `\n\nProperty address: ${address}` : ''),
          });

          const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8192,
            messages: [{ role: 'user', content: contentBlocks }],
          });

          const text = response.content
            .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
            .map((b) => b.text)
            .join('');

          try {
            offers.push({ label, fileName: file.name, data: JSON.parse(cleanJsonResponse(text)) });
          } catch {
            offers.push({ label, fileName: file.name, data: null, error: `Failed to parse response: ${text.slice(0, 200)}` });
          }
        } catch (err) {
          offers.push({ label, fileName: file.name, data: null, error: String(err).slice(0, 300) });
        }
      }
    }

    // Generate comparison summary if 2+ valid offers
    let comparison = null;
    const validOffers = offers.filter((o) => o.data);
    if (validOffers.length >= 2) {
      try {
        const comparisonInput = validOffers.map((o) => ({ label: o.label, ...o.data }));
        const summaryResponse = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8192,
          messages: [{
            role: 'user',
            content: `${SUMMARY_PROMPT}\n\nOffers data:\n${JSON.stringify(comparisonInput, null, 2)}`,
          }],
        });

        const summaryText = summaryResponse.content
          .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('');

        comparison = JSON.parse(cleanJsonResponse(summaryText));
      } catch {
        comparison = null;
      }
    }

    return NextResponse.json({ address, offers, comparison });
  } catch (error) {
    console.error('Contract comparison error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Comparison failed: ${message}` }, { status: 500 });
  }
}
