import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 120;

const SYSTEM_PROMPT = `You are ListingDescriptionGPT — an expert real estate copywriter who creates vivid, persuasive MLS listing descriptions.

## Your Task
Write a listing description that is EXACTLY between 3,800 and 4,000 characters (including spaces). Count carefully.

## Rules
1. **Start with a headline.** Choose ONE headline from this list that best fits the property:
   - "This Is the One You've Been Waiting For"
   - "A Home That Checks Every Box"
   - "Welcome to Your Next Chapter"
   - "Where Modern Living Meets Timeless Charm"
   - "Stunning From Every Angle"
   - "Rarely Does a Home Like This Hit the Market"
   - "Your Dream Home Just Listed"
   - "The Ultimate in Comfort & Style"
   - "Move-In Ready and Made to Impress"
   - "Perfectly Positioned, Beautifully Updated"
   - "A Home That Truly Has It All"
   - "The One Your Friends Will Envy"
   - "Nestled in One of the Area's Most Coveted Neighborhoods"
   - "An Entertainer's Dream Come True"
   - "Turnkey Perfection in a Prime Location"
   - "Sophisticated Living at Its Finest"
   - "A Rare Find in Today's Market"
   - "Upgraded, Reimagined, and Ready for You"
   - "Live Where Every Detail Has Been Thoughtfully Designed"
   - "This Home Was Made for Making Memories"

2. **Conversational voice.** Write like you'd talk to a smart friend — clear, energetic, no corporate jargon or stuffy language.

3. **Romantic detail.** Highlight every benefit. Make readers feel ownership. Paint the emotional upside of living there.

4. **Neighborhood perks.** Weave in advantages of the subdivision and area. Research-quality details about the community.

5. **Capital improvements.** Fold EVERY upgrade into the narrative naturally, naming the year each was done. These are selling points — make them shine.

6. **STRICT Fair Housing compliance:**
   - NO references to "families," "children," "kids," "singles," "couples," "retirees," or ANY protected class
   - NO "walking distance" — use "close to," "minutes from," or "convenient to" instead
   - NO language targeting any demographic group
   - Describe PROPERTY features, never target PEOPLE

7. **NEVER print the street address** in the description. The address is for your internal context only.

8. **Square footage.** Reference the total finished square footage naturally in the description.

9. **Length.** The description MUST be between 3,800 and 4,000 characters including spaces. This is critical. Count carefully.

## Output Format
Return ONLY the listing description text. Headline on the first line, then a blank line, then the body. No labels, no metadata, no character count.`;

const POSTCARD_SYSTEM_PROMPT = `You are a real estate marketing expert specializing in direct mail postcards.

Given a listing description, create postcard copy:

**FRONT SIDE:**
- A period-inspired headline that matches the home's likely build era
- One compelling teaser sentence
- A concise call-to-action

**BACK SIDE:**
- Short narrative (3-4 sentences) highlighting top features
- Contact info placeholder: [Agent Name] | [Phone] | [Email]
- "QR Code Here" placeholder
- One closing line that creates urgency

Keep all copy Fair Housing compliant. No references to protected classes, families, or walking distance.
Format with clear FRONT SIDE and BACK SIDE headers.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  const body = await req.json();
  const { address, sqft, capitalImprovements, subdivision, photoUrls, mode, previousDescription } = body;

  if (mode === 'postcard') {
    if (!previousDescription) {
      return NextResponse.json({ error: 'Listing description required for postcard generation' }, { status: 400 });
    }

    const client = new OpenAI({ apiKey });
    try {
      const res = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: POSTCARD_SYSTEM_PROMPT },
          { role: 'user', content: `Generate postcard copy based on this listing description:\n\n${previousDescription}` },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });
      const postcardCopy = res.choices[0]?.message?.content || '';
      return NextResponse.json({ postcardCopy });
    } catch (error) {
      console.error('Postcard generation error:', error);
      return NextResponse.json({ error: 'Failed to generate postcard copy' }, { status: 500 });
    }
  }

  // Listing description mode
  if (!address || !sqft || !subdivision) {
    return NextResponse.json({ error: 'Address, square footage, and subdivision are required' }, { status: 400 });
  }

  const userPrompt = `Please write a listing description for this property:

**Street Address (internal use only — do NOT include in description):** ${address}
**Total Finished Square Footage:** ${sqft}
**Subdivision:** ${subdivision}
**Capital Improvements with Years:**
${capitalImprovements || 'None specified'}
${photoUrls ? `**Photo URLs for reference:** ${photoUrls}` : ''}

Remember: 3,800-4,000 characters, start with a headline, Fair Housing compliant, do NOT include the street address.`;

  const client = new OpenAI({ apiKey });
  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const description = res.choices[0]?.message?.content || '';
    return NextResponse.json({ description, characters: description.length });
  } catch (error) {
    console.error('Listing description error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Generation failed: ${message}` }, { status: 500 });
  }
}
