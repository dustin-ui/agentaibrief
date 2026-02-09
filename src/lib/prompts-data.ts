export interface Prompt {
  id: string;
  title: string;
  category: string;
  preview: string;
  fullPrompt: string;
  isFree: boolean;
}

export const PROMPT_CATEGORIES = [
  'All',
  'Listing Descriptions',
  'Follow-up Emails',
  'Market Analysis',
  'Social Posts',
  'Objection Handling',
  'Open House',
  'Buyer Consultation',
];

export const PROMPTS: Prompt[] = [
  // Listing Descriptions
  {
    id: 'ld-1',
    title: 'Luxury Listing Description',
    category: 'Listing Descriptions',
    preview: 'Write a luxury listing description that evokes emotion and lifestyle...',
    fullPrompt: `Act as a luxury real estate copywriter. Write a compelling MLS listing description for the following property:

[PROPERTY DETAILS: Address, beds/baths, sq ft, key features]

Requirements:
- Open with a lifestyle hook, NOT the bedroom count
- Paint a picture of what it feels like to live there
- Highlight 3-5 unique features with sensory language
- Include neighborhood/location benefits
- End with a soft call-to-action
- Keep under 250 words
- Avoid clichés: "must-see," "won't last long," "dream home"
- Tone: sophisticated, warm, aspirational`,
    isFree: true,
  },
  {
    id: 'ld-2',
    title: 'Starter Home Description',
    category: 'Listing Descriptions',
    preview: 'Create an inviting description for first-time buyer properties...',
    fullPrompt: `Write an inviting MLS listing description targeting first-time homebuyers.

Property: [ADDRESS, BEDS/BATHS, SQ FT, FEATURES]

Guidelines:
- Emphasize value, move-in readiness, and potential
- Mention proximity to transit, dining, entertainment
- Highlight low-maintenance features
- Address common first-time buyer desires: modern kitchen, outdoor space, storage
- Include neighborhood walkability/lifestyle
- Tone: welcoming, exciting, achievable
- Under 200 words`,
    isFree: false,
  },
  {
    id: 'ld-3',
    title: 'Investment Property Description',
    category: 'Listing Descriptions',
    preview: 'Data-driven description targeting real estate investors...',
    fullPrompt: `Write a listing description targeting real estate investors.

Property: [ADDRESS, BEDS/BATHS, SQ FT, CURRENT RENT, CAP RATE]

Include:
- Lead with investment metrics (cap rate, cash flow potential)
- Highlight rental demand indicators in the area
- Mention value-add opportunities
- Note proximity to employment centers, transit, universities
- Include recent comparable rental rates
- Tone: professional, data-driven, opportunity-focused
- Under 200 words`,
    isFree: false,
  },
  // Follow-up Emails
  {
    id: 'fe-1',
    title: 'Post-Showing Follow-Up',
    category: 'Follow-up Emails',
    preview: 'Personalized email after a buyer showing with next steps...',
    fullPrompt: `Write a follow-up email to buyers after a property showing.

Details:
- Buyer names: [NAMES]
- Property: [ADDRESS]
- What they liked: [FEATURES THEY MENTIONED]
- Concerns: [ANY OBJECTIONS OR HESITATIONS]

Requirements:
- Reference specific things they said during the showing
- Address their concerns subtly
- Suggest a logical next step (second showing, offer discussion, see comparables)
- Keep it under 150 words
- Tone: warm, helpful, not pushy
- Include a clear but soft call-to-action`,
    isFree: true,
  },
  {
    id: 'fe-2',
    title: 'Listing Appointment Follow-Up',
    category: 'Follow-up Emails',
    preview: 'Win the listing with a compelling follow-up email...',
    fullPrompt: `Write a follow-up email after a listing appointment where the seller is interviewing multiple agents.

Details:
- Seller name: [NAME]
- Property: [ADDRESS, TYPE]
- My differentiators: [LIST 3 KEY SELLING POINTS]
- Their main concern: [PRICE/TIMELINE/MARKETING]

Requirements:
- Recap 1-2 key points from the meeting
- Reinforce your unique value proposition
- Address their primary concern with a specific solution
- Include a subtle urgency element (market timing, buyer demand)
- End with a confident but respectful close
- Under 200 words`,
    isFree: false,
  },
  {
    id: 'fe-3',
    title: 'Past Client Check-In',
    category: 'Follow-up Emails',
    preview: 'Stay top-of-mind with past clients naturally...',
    fullPrompt: `Write a casual check-in email to a past client I helped buy/sell [TIMEFRAME] ago.

Client: [NAME]
Transaction: [BOUGHT/SOLD, ADDRESS, APPROXIMATE DATE]

Requirements:
- Feel genuinely personal, not mass-email-ish
- Reference something specific about their purchase/situation
- Share one piece of valuable info (market update, home value estimate, neighborhood news)
- Subtly remind them you're available for referrals
- DO NOT sound like you're asking for business
- Tone: friendly, genuine, brief
- Under 120 words`,
    isFree: false,
  },
  // Market Analysis
  {
    id: 'ma-1',
    title: 'Monthly Market Report',
    category: 'Market Analysis',
    preview: 'Generate a professional market analysis report...',
    fullPrompt: `Create a monthly real estate market report for [AREA/CITY/COUNTY].

Include these sections:
1. Executive Summary (3-4 sentences)
2. Price Trends — median price, YoY change, price per sq ft
3. Inventory Analysis — active listings, months of supply, new listings
4. Days on Market — average DOM, trend direction
5. Buyer vs Seller Market indicator
6. Interest Rate Impact — current rates, effect on buying power
7. Neighborhood Spotlight — highlight one hot area
8. Prediction — what to expect next month

Data to incorporate: [PASTE YOUR MLS DATA OR KEY STATS]

Tone: authoritative, data-driven, accessible to non-experts
Format: use headers, bullet points, bold key numbers
Include a CTA to contact me for a personalized analysis`,
    isFree: true,
  },
  {
    id: 'ma-2',
    title: 'CMA Presentation Script',
    category: 'Market Analysis',
    preview: 'Script for presenting a comparative market analysis to sellers...',
    fullPrompt: `Write a script for presenting a CMA to potential sellers.

Property: [ADDRESS]
Suggested list price: [PRICE]
Comparable sales: [LIST 3-5 COMPS WITH PRICES]

Script should cover:
1. Opening — build rapport, set agenda (2 min)
2. Market overview — local trends that affect their home (3 min)
3. Comparable analysis — walk through each comp, explain adjustments (5 min)
4. Pricing strategy — recommended price with rationale (3 min)
5. My marketing plan — what I'll do differently (3 min)
6. Close — next steps, listing agreement (2 min)

Tone: confident, consultative, data-backed
Include transition phrases between sections
Note where to pause for questions`,
    isFree: false,
  },
  // Social Posts
  {
    id: 'sp-1',
    title: 'Just Sold Celebration',
    category: 'Social Posts',
    preview: 'Engaging social media posts for just-sold announcements...',
    fullPrompt: `Write 3 different social media posts for a just-sold property.

Details:
- Property: [ADDRESS]
- Sale highlights: [DAYS ON MARKET, OVER/UNDER ASKING, # OF OFFERS]
- Special story: [ANY UNIQUE ANGLE — first-time buyer, relocated, etc.]

Create 3 versions:
1. CELEBRATORY — focus on the win, tag the buyers (with permission)
2. EDUCATIONAL — explain WHY it sold fast/over asking, teach followers
3. TESTIMONIAL — write as if the client is sharing their experience

For each:
- Instagram caption (under 150 words)
- 5-7 relevant hashtags
- A call-to-action
- Emoji usage: moderate, not excessive`,
    isFree: true,
  },
  {
    id: 'sp-2',
    title: 'Instagram Carousel Ideas',
    category: 'Social Posts',
    preview: 'High-engagement carousel post concepts for real estate...',
    fullPrompt: `Generate 5 Instagram carousel post ideas for a real estate agent in [AREA].

For each carousel:
- Title slide headline (attention-grabbing)
- 5-7 slide topics/content
- Caption (under 100 words)
- Target audience
- CTA for the last slide

Topics should mix:
- Educational (market stats, buying/selling tips)
- Local lifestyle (neighborhood guides, hidden gems)
- Behind-the-scenes (agent life, showing stories)
- Value-driven (money-saving tips, investment advice)

Make them shareable and saveable — optimize for Instagram's algorithm.`,
    isFree: false,
  },
  {
    id: 'sp-3',
    title: 'Market Update Reel Script',
    category: 'Social Posts',
    preview: 'Short-form video script for market update content...',
    fullPrompt: `Write a 45-60 second Instagram Reel / TikTok script for a real estate market update.

Market: [AREA]
Key stats: [MEDIAN PRICE, INVENTORY, DOM, YOY CHANGES]

Structure:
- Hook (first 3 seconds — stop the scroll)
- 3 key data points with context (not just numbers)
- What this means for buyers
- What this means for sellers
- CTA (DM me, link in bio, comment "MARKET")

Requirements:
- Conversational, not newscaster
- Use pattern interrupts ("here's what nobody's talking about...")
- Include on-screen text suggestions for each segment
- Keep energy up throughout`,
    isFree: false,
  },
  // Objection Handling
  {
    id: 'oh-1',
    title: '"Your Commission Is Too High"',
    category: 'Objection Handling',
    preview: 'Professional response to commission objections...',
    fullPrompt: `Write a professional, non-defensive response to a seller who says: "Your commission is too high. We're considering a discount brokerage."

Response should include:
1. Acknowledge their concern (validate, don't dismiss)
2. Reframe the conversation from cost to net proceeds
3. 3 specific value points that justify full commission:
   - Professional marketing investment (photography, staging, ads)
   - Negotiation expertise (average sale price vs. list price)
   - Time and stress savings
4. A data point: "Full-service agents net sellers an average of X% more"
5. Collaborative close: "Let me show you exactly what I invest in every listing"

Tone: confident, empathetic, not defensive
Format: conversation script (what to say, not an email)
Include a follow-up question that redirects to value`,
    isFree: true,
  },
  {
    id: 'oh-2',
    title: '"We Want to Wait for the Market"',
    category: 'Objection Handling',
    preview: 'Counter the wait-and-see seller mentality with data...',
    fullPrompt: `Write talking points for when a seller says: "We want to wait 6-12 months for the market to improve."

Address these angles:
1. Opportunity cost of waiting (carrying costs, equity sitting idle)
2. Current buyer demand vs. projected competition
3. Interest rate impact on buyer purchasing power
4. Seasonal market patterns and optimal listing windows
5. The "crystal ball" fallacy — nobody can time the market perfectly
6. What they could do NOW with the equity

Format: 6 talking points, each with:
- The point (1 sentence)
- Supporting data/logic (2-3 sentences)
- Bridge to next point

Tone: consultative, data-driven, empathetic (not condescending)
End with: "Based on your specific goals, here's what I'd recommend..."`,
    isFree: false,
  },
  {
    id: 'oh-3',
    title: '"I Can Sell It Myself (FSBO)"',
    category: 'Objection Handling',
    preview: 'Tactful response to For Sale By Owner considerations...',
    fullPrompt: `Write a respectful response to a homeowner considering selling FSBO.

Include:
1. Respect their confidence and entrepreneurial spirit
2. Share FSBO vs agent-assisted sale statistics (price, time, legal risk)
3. Explain the hidden work: marketing, showings, negotiations, paperwork, liability
4. Mention the safety concern of opening your home to unvetted strangers
5. Offer a compromise: "Let me show you what I'd do — if you don't see the value, no hard feelings"

Tone: respectful, informative, zero condescension
Format: conversational script
Include 2-3 questions that help the seller realize the complexity`,
    isFree: false,
  },
  // Open House
  {
    id: 'oh2-1',
    title: 'Open House Follow-Up Email',
    category: 'Open House',
    preview: 'Convert open house visitors into clients...',
    fullPrompt: `Write a follow-up email for open house visitors.

Property: [ADDRESS]
Visitor name: [NAME]
Notes: [WHAT THEY LIKED, THEIR SITUATION — buying timeline, pre-approved, etc.]

Requirements:
- Reference something specific from your conversation
- Share one additional detail about the property they might not know
- If they seemed interested: suggest a private showing or offer discussion
- If they were browsing: offer to set up a custom search
- Include a link to similar listings or your website
- Under 120 words
- Mobile-friendly formatting (short paragraphs)`,
    isFree: true,
  },
  {
    id: 'oh2-2',
    title: 'Open House Social Promotion',
    category: 'Open House',
    preview: 'Multi-platform social posts to drive open house traffic...',
    fullPrompt: `Create social media posts to promote an upcoming open house.

Property: [ADDRESS, KEY FEATURES, PRICE]
Date/Time: [OPEN HOUSE DATE AND TIME]
Special elements: [REFRESHMENTS, GIVEAWAYS, NEIGHBORHOOD WALK, etc.]

Create posts for:
1. Instagram (caption + story sequence ideas)
2. Facebook (event-style post + neighborhood group post)
3. Nextdoor (neighbor-friendly, invite-the-neighborhood angle)

Each post should:
- Create FOMO (limited time, exclusive preview)
- Highlight 2-3 standout features
- Include clear date/time/address
- Have a unique CTA for each platform
- Use neighborhood-specific language`,
    isFree: false,
  },
  // Buyer Consultation
  {
    id: 'bc-1',
    title: 'Buyer Consultation Presentation',
    category: 'Buyer Consultation',
    preview: 'Structure a winning buyer consultation meeting...',
    fullPrompt: `Create an outline and talking points for a buyer consultation meeting.

Buyer profile: [FIRST-TIME / MOVE-UP / INVESTOR / RELOCATING]
Budget: [PRICE RANGE]
Target area: [NEIGHBORHOODS/CITIES]

Consultation structure:
1. Introduction & rapport (5 min) — questions about their lifestyle and goals
2. Market overview (5 min) — current conditions in their target area
3. The buying process (10 min) — step-by-step walkthrough
4. Financing (5 min) — pre-approval importance, rate discussion
5. My value as their agent (5 min) — what I do that others don't
6. Search criteria deep dive (10 min) — needs vs wants exercise
7. Next steps (5 min) — pre-approval, portal setup, first showings

For each section, provide:
- Key talking points
- Questions to ask them
- Common concerns to address proactively`,
    isFree: true,
  },
  {
    id: 'bc-2',
    title: 'Buyer Needs Assessment',
    category: 'Buyer Consultation',
    preview: 'Comprehensive questionnaire to uncover buyer priorities...',
    fullPrompt: `Create a comprehensive buyer needs assessment questionnaire I can use during consultations.

Categories:
1. Lifestyle & Location (10 questions)
   - Commute, schools, walkability, urban vs suburban
2. Property Must-Haves vs Nice-to-Haves (8 questions)
   - Beds/baths, garage, yard, specific features
3. Financial Readiness (6 questions)
   - Pre-approval, down payment, monthly budget, closing costs
4. Timeline & Motivation (5 questions)
   - Urgency, lease expiration, life event triggers
5. Deal Breakers (5 questions)
   - HOA, age of home, renovation willingness, location limits

Format each question with:
- The question
- Why it matters (note for the agent)
- Follow-up question if the answer reveals something important`,
    isFree: false,
  },
  {
    id: 'bc-3',
    title: 'Relocation Buyer Welcome',
    category: 'Buyer Consultation',
    preview: 'Welcome packet content for out-of-area buyers...',
    fullPrompt: `Write a welcome email for a buyer relocating to [AREA] from out of state.

Details:
- Buyer name: [NAME]
- Relocating from: [CITY/STATE]
- Reason: [JOB TRANSFER, FAMILY, LIFESTYLE]
- Target neighborhoods: [IF KNOWN]

Include:
1. Warm welcome and excitement about helping them
2. Brief overview of the area (vibe, culture, what makes it special)
3. 3-5 neighborhood recommendations based on their profile
4. Practical info: commute patterns, school districts, cost of living comparison
5. Offer to do a virtual tour / video call walkthrough of neighborhoods
6. "Relocation checklist" — 5 things to do before house hunting
7. CTA to schedule a discovery call

Tone: helpful, knowledgeable local expert, enthusiastic`,
    isFree: false,
  },
];
