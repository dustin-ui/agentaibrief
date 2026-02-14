export interface PromptVariable {
  key: string;
  label: string;
  placeholder: string;
}

export interface Prompt {
  id: string;
  title: string;
  category: string;
  preview: string;
  fullPrompt: string;
  isFree: boolean;
  aiTools: ('ChatGPT' | 'Claude' | 'Gemini' | 'Perplexity')[];
  variables: PromptVariable[];
}

export const PROMPT_CATEGORIES = [
  'All',
  'Listings',
  'Email Marketing',
  'Social Media',
  'Video Scripts',
  'Market Analysis',
  'Client Communication',
  'SEO/AEO',
  'Lead Generation',
  'Open Houses',
  'Buyer/Seller Presentations',
];

export const AI_TOOL_COLORS: Record<string, string> = {
  ChatGPT: 'bg-green-900/50 text-green-300 border-green-700/50',
  Claude: 'bg-orange-900/50 text-orange-300 border-orange-700/50',
  Gemini: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
  Perplexity: 'bg-purple-900/50 text-purple-300 border-purple-700/50',
};

export const PROMPTS: Prompt[] = [
  // ============ LISTINGS (6 prompts, 3 free) ============
  {
    id: 'list-1',
    title: 'Luxury Listing Description',
    category: 'Listings',
    preview: 'Craft an emotion-driven luxury listing that sells lifestyle, not just bedrooms.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: true,
    variables: [
      { key: 'ADDRESS', label: 'Property Address', placeholder: '123 Main St, McLean, VA' },
      { key: 'BEDS_BATHS', label: 'Beds/Baths', placeholder: '5 bed / 4.5 bath' },
      { key: 'SQFT', label: 'Square Footage', placeholder: '4,200' },
      { key: 'KEY_FEATURES', label: 'Key Features', placeholder: 'Chef\'s kitchen, pool, wine cellar' },
      { key: 'NEIGHBORHOOD', label: 'Neighborhood', placeholder: 'Great Falls' },
    ],
    fullPrompt: `Act as a luxury real estate copywriter. Write a compelling MLS listing description for this property:

Address: [ADDRESS]
Beds/Baths: [BEDS_BATHS]
Sq Ft: [SQFT]
Key Features: [KEY_FEATURES]
Neighborhood: [NEIGHBORHOOD]

Requirements:
- Open with a lifestyle hook, NOT the bedroom count
- Paint a picture of what it FEELS like to live there
- Highlight 3-5 unique features with sensory language
- Include neighborhood/location benefits
- End with a soft call-to-action
- Keep under 250 words for MLS character limits
- Avoid clichés: "must-see," "won't last long," "dream home"
- Tone: sophisticated, warm, aspirational`,
  },
  {
    id: 'list-2',
    title: 'First-Time Buyer Listing Description',
    category: 'Listings',
    preview: 'Write an inviting description that speaks directly to first-time homebuyers.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: true,
    variables: [
      { key: 'ADDRESS', label: 'Property Address', placeholder: '456 Oak Ave, Reston, VA' },
      { key: 'BEDS_BATHS', label: 'Beds/Baths', placeholder: '3 bed / 2 bath' },
      { key: 'SQFT', label: 'Square Footage', placeholder: '1,450' },
      { key: 'PRICE', label: 'List Price', placeholder: '$425,000' },
      { key: 'KEY_FEATURES', label: 'Key Features', placeholder: 'Updated kitchen, fenced yard, near Metro' },
    ],
    fullPrompt: `Write an inviting MLS listing description targeting first-time homebuyers.

Property: [ADDRESS]
Beds/Baths: [BEDS_BATHS] | Sq Ft: [SQFT] | Price: [PRICE]
Features: [KEY_FEATURES]

Requirements:
- Lead with affordability and value
- Emphasize move-in readiness and low maintenance
- Highlight proximity to commute routes, schools, dining
- Make homeownership feel achievable and exciting
- Include monthly payment context if possible ("less than rent")
- Keep under 200 words
- Tone: warm, encouraging, relatable`,
  },
  {
    id: 'list-3',
    title: 'Investment Property Listing',
    category: 'Listings',
    preview: 'Write a data-driven listing targeting real estate investors.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: true,
    variables: [
      { key: 'ADDRESS', label: 'Property Address', placeholder: '789 Elm St, Arlington, VA' },
      { key: 'PRICE', label: 'List Price', placeholder: '$550,000' },
      { key: 'RENT_ESTIMATE', label: 'Estimated Monthly Rent', placeholder: '$3,200' },
      { key: 'PROPERTY_TYPE', label: 'Property Type', placeholder: 'Townhouse' },
      { key: 'KEY_FEATURES', label: 'Key Features', placeholder: 'Separate entrance, updated systems, near Amazon HQ2' },
    ],
    fullPrompt: `Write an MLS listing description targeting real estate investors.

Property: [ADDRESS] | Type: [PROPERTY_TYPE]
List Price: [PRICE] | Estimated Rent: [RENT_ESTIMATE]/month
Features: [KEY_FEATURES]

Requirements:
- Lead with ROI potential and cap rate opportunity
- Include rental income potential
- Highlight low-maintenance features
- Mention area growth/development trends
- Include investor-friendly details (separate meters, etc.)
- Keep under 200 words
- Tone: data-driven, opportunity-focused`,
  },
  {
    id: 'list-4',
    title: 'Coming Soon Teaser Description',
    category: 'Listings',
    preview: 'Create FOMO-driven copy for a coming soon listing.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'NEIGHBORHOOD', label: 'Neighborhood', placeholder: 'Old Town Alexandria' },
      { key: 'PROPERTY_TYPE', label: 'Property Type', placeholder: 'Colonial' },
      { key: 'BEDS_BATHS', label: 'Beds/Baths', placeholder: '4 bed / 3 bath' },
      { key: 'UNIQUE_FEATURE', label: 'Standout Feature', placeholder: 'Rooftop terrace with monument views' },
      { key: 'PRICE_RANGE', label: 'Price Range', placeholder: '$800s' },
    ],
    fullPrompt: `Write a "Coming Soon" teaser listing that creates urgency and FOMO.

Neighborhood: [NEIGHBORHOOD]
Type: [PROPERTY_TYPE] | [BEDS_BATHS]
Standout Feature: [UNIQUE_FEATURE]
Price Range: [PRICE_RANGE]

Requirements:
- Create mystery and exclusivity
- Tease the best feature without revealing everything
- Use "insider access" language
- Include a CTA to get on the early access list
- Keep under 150 words
- DO NOT include the exact address
- Tone: exclusive, intriguing, urgent`,
  },
  {
    id: 'list-5',
    title: 'Condo/Urban Living Description',
    category: 'Listings',
    preview: 'Write a walkability-focused condo listing for urban buyers.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'ADDRESS', label: 'Property Address', placeholder: '1000 Wilson Blvd #1205, Arlington, VA' },
      { key: 'BEDS_BATHS', label: 'Beds/Baths', placeholder: '2 bed / 2 bath' },
      { key: 'BUILDING_NAME', label: 'Building Name', placeholder: 'The Residences at Rosslyn' },
      { key: 'AMENITIES', label: 'Building Amenities', placeholder: 'Rooftop pool, concierge, gym, EV charging' },
      { key: 'WALK_SCORE', label: 'Walk Score', placeholder: '95' },
    ],
    fullPrompt: `Write a lifestyle-focused condo listing for urban professionals.

Address: [ADDRESS] | Building: [BUILDING_NAME]
[BEDS_BATHS] | Walk Score: [WALK_SCORE]
Amenities: [AMENITIES]

Requirements:
- Lead with the lifestyle: walkability, restaurants, nightlife
- Highlight building amenities as extensions of living space
- Mention commute convenience (Metro, bike trails)
- Appeal to young professionals and downsizers
- Include smart home / modern features
- Keep under 200 words
- Tone: vibrant, modern, aspirational`,
  },
  {
    id: 'list-6',
    title: 'Vacant Land / Lot Description',
    category: 'Listings',
    preview: 'Sell the vision of what could be built on a vacant lot.',
    aiTools: ['ChatGPT'],
    isFree: false,
    variables: [
      { key: 'ADDRESS', label: 'Location', placeholder: 'Lot 5, River Rd, Great Falls, VA' },
      { key: 'ACREAGE', label: 'Lot Size', placeholder: '2.3 acres' },
      { key: 'ZONING', label: 'Zoning', placeholder: 'R-1 Residential' },
      { key: 'FEATURES', label: 'Land Features', placeholder: 'Creek frontage, mature trees, flat build site' },
    ],
    fullPrompt: `Write a compelling listing description for vacant land.

Location: [ADDRESS] | Size: [ACREAGE] | Zoning: [ZONING]
Features: [FEATURES]

Requirements:
- Sell the VISION of what could be built
- Describe the setting with sensory language
- Mention zoning/build potential
- Highlight natural features
- Include utility/road access details
- Appeal to custom home builders
- Keep under 200 words`,
  },

  // ============ EMAIL MARKETING (6 prompts, 2 free) ============
  {
    id: 'email-1',
    title: 'Just Listed Email Announcement',
    category: 'Email Marketing',
    preview: 'Send a high-converting new listing announcement to your database.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: true,
    variables: [
      { key: 'ADDRESS', label: 'Property Address', placeholder: '123 Maple Dr, Vienna, VA' },
      { key: 'PRICE', label: 'List Price', placeholder: '$875,000' },
      { key: 'BEDS_BATHS', label: 'Beds/Baths', placeholder: '4 bed / 3.5 bath' },
      { key: 'HERO_FEATURE', label: 'Hero Feature', placeholder: 'Brand new chef\'s kitchen with waterfall island' },
      { key: 'OPEN_HOUSE_DATE', label: 'Open House Date', placeholder: 'Saturday, Feb 15th 1-4pm' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Write a "Just Listed" email for my real estate database.

Property: [ADDRESS]
Price: [PRICE] | [BEDS_BATHS]
Hero Feature: [HERO_FEATURE]
Open House: [OPEN_HOUSE_DATE]
Agent: [AGENT_NAME]

Requirements:
- Subject line (create 3 options, one with emoji)
- Preview text (40 chars max)
- Hook in first sentence — NOT "I'm excited to announce"
- Lead with the hero feature or neighborhood story
- 3-4 short paragraphs max
- Clear CTA: schedule showing or attend open house
- P.S. line with urgency
- Mobile-friendly: short paragraphs, no walls of text
- Tone: enthusiastic but not salesy`,
  },
  {
    id: 'email-2',
    title: 'Market Update Newsletter',
    category: 'Email Marketing',
    preview: 'Monthly market update email that positions you as the local expert.',
    aiTools: ['ChatGPT', 'Claude', 'Perplexity'],
    isFree: true,
    variables: [
      { key: 'CITY', label: 'City/Area', placeholder: 'Northern Virginia' },
      { key: 'MONTH', label: 'Month', placeholder: 'January 2026' },
      { key: 'MEDIAN_PRICE', label: 'Median Price', placeholder: '$650,000' },
      { key: 'PRICE_CHANGE', label: 'YoY Price Change', placeholder: '+4.2%' },
      { key: 'DAYS_ON_MARKET', label: 'Avg Days on Market', placeholder: '18' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Write a monthly market update email for my real estate database.

Area: [CITY] | Month: [MONTH]
Median Price: [MEDIAN_PRICE] ([PRICE_CHANGE] YoY)
Avg Days on Market: [DAYS_ON_MARKET]
Agent: [AGENT_NAME]

Requirements:
- Subject line options (3, including one question-based)
- Open with a surprising stat or counter-narrative
- Break down what the numbers mean for BUYERS and SELLERS separately
- Include a "what I'm telling my clients" section (builds authority)
- End with a personal market prediction (bold but defensible)
- CTA: "Reply to this email for a free home value estimate"
- Keep under 400 words
- Tone: expert, conversational, not boring`,
  },
  {
    id: 'email-3',
    title: 'Expired Listing Outreach Email',
    category: 'Email Marketing',
    preview: 'Tactful email to expired listing homeowners without being pushy.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'HOMEOWNER_NAME', label: 'Homeowner Name', placeholder: 'Sarah' },
      { key: 'ADDRESS', label: 'Property Address', placeholder: '456 Pine St, Fairfax, VA' },
      { key: 'DAYS_ON_MARKET', label: 'Days It Was Listed', placeholder: '120' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
      { key: 'RECENT_SALE', label: 'Recent Nearby Sale', placeholder: '440 Pine St sold for $625K in 14 days' },
    ],
    fullPrompt: `Write an email to a homeowner whose listing just expired.

Homeowner: [HOMEOWNER_NAME]
Property: [ADDRESS] (was listed for [DAYS_ON_MARKET] days)
Nearby Comp: [RECENT_SALE]
Agent: [AGENT_NAME]

Requirements:
- Subject line: curiosity-driven, NOT "Your listing expired"
- Acknowledge their frustration WITHOUT bashing previous agent
- Lead with a specific insight about WHY it may not have sold
- Reference the nearby comp as proof of demand
- Offer ONE specific thing you'd do differently
- CTA: 15-minute no-pressure call
- Keep under 200 words
- Tone: empathetic, confident, not pushy or salesy`,
  },
  {
    id: 'email-4',
    title: 'Past Client Check-In (Anniversary)',
    category: 'Email Marketing',
    preview: 'Annual home purchase anniversary email to stay top of mind.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'CLIENT_NAME', label: 'Client Name', placeholder: 'Mike and Jenny' },
      { key: 'YEARS', label: 'Years Since Purchase', placeholder: '2' },
      { key: 'ADDRESS', label: 'Their Address', placeholder: '789 Oak Ct, Herndon, VA' },
      { key: 'EQUITY_ESTIMATE', label: 'Estimated Equity Gained', placeholder: '$85,000' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Write a home purchase anniversary check-in email.

Client: [CLIENT_NAME]
Years: [YEARS] since purchasing [ADDRESS]
Estimated Equity Gained: [EQUITY_ESTIMATE]
Agent: [AGENT_NAME]

Requirements:
- Subject: personal, not templated
- Open with congratulations on the anniversary
- Share their estimated equity gain (builds excitement)
- Mention 1-2 neighborhood improvements since they bought
- Offer a complimentary updated home valuation
- Soft ask for referrals: "Know anyone thinking of making a move?"
- Keep under 150 words
- Tone: warm, personal, celebratory`,
  },
  {
    id: 'email-5',
    title: 'Open House Follow-Up Drip (3 emails)',
    category: 'Email Marketing',
    preview: 'Three-email sequence for leads who attended your open house.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'PROPERTY_ADDRESS', label: 'Open House Address', placeholder: '321 Birch Ln, McLean, VA' },
      { key: 'LEAD_NAME', label: 'Lead Name', placeholder: 'David' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
      { key: 'PRICE', label: 'List Price', placeholder: '$1,200,000' },
    ],
    fullPrompt: `Write a 3-email drip sequence for open house attendees.

Property: [PROPERTY_ADDRESS] | Price: [PRICE]
Lead: [LEAD_NAME]
Agent: [AGENT_NAME]

EMAIL 1 (Send same evening):
- Thank them for coming
- Share one detail they might have missed
- Ask what they thought
- CTA: schedule private showing

EMAIL 2 (Send day 3):
- Share a relevant market insight about the area
- Mention any other interest/offers on the property
- Include 2-3 similar listings they might like
- CTA: "Want me to set up a custom search?"

EMAIL 3 (Send day 7):
- Provide genuine value (neighborhood guide, school ratings)
- Soft relationship-building
- CTA: "Even if this home wasn't the one, I'd love to help you find it"

Requirements per email:
- Subject lines that get opened (not generic)
- Under 150 words each
- Tone escalation: helpful → informative → personal`,
  },
  {
    id: 'email-6',
    title: 'Buyer Pre-Approval Nudge Email',
    category: 'Email Marketing',
    preview: 'Get fence-sitters to take action and get pre-approved.',
    aiTools: ['ChatGPT'],
    isFree: false,
    variables: [
      { key: 'LEAD_NAME', label: 'Lead Name', placeholder: 'Amanda' },
      { key: 'CITY', label: 'Target Area', placeholder: 'Arlington, VA' },
      { key: 'PRICE_RANGE', label: 'Their Price Range', placeholder: '$500K-$650K' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Write an email nudging a buyer lead to get pre-approved.

Lead: [LEAD_NAME] | Area: [CITY] | Budget: [PRICE_RANGE]
Agent: [AGENT_NAME]

Requirements:
- Subject line that creates urgency without pressure
- Open with market context: why pre-approval matters NOW
- Explain what pre-approval IS in simple terms
- Address common fears (doesn't affect credit score much, etc.)
- Offer to connect them with your preferred lender
- Share a quick story of a client who lost a home without pre-approval
- CTA: "Can I make an intro to my lender? Takes 15 minutes."
- Keep under 200 words
- Tone: helpful big-brother/sister energy`,
  },

  // ============ SOCIAL MEDIA (6 prompts, 2 free) ============
  {
    id: 'social-1',
    title: 'Instagram Carousel: Market Stats',
    category: 'Social Media',
    preview: 'Create a 10-slide Instagram carousel breaking down local market stats.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: true,
    variables: [
      { key: 'CITY', label: 'City/Area', placeholder: 'Northern Virginia' },
      { key: 'MONTH', label: 'Month', placeholder: 'January 2026' },
      { key: 'MEDIAN_PRICE', label: 'Median Price', placeholder: '$650,000' },
      { key: 'INVENTORY', label: 'Active Listings', placeholder: '1,847' },
      { key: 'DAYS_ON_MARKET', label: 'Avg DOM', placeholder: '18 days' },
    ],
    fullPrompt: `Create content for a 10-slide Instagram carousel about the [CITY] housing market for [MONTH].

Stats: Median Price [MEDIAN_PRICE] | Active Listings [INVENTORY] | Avg DOM [DAYS_ON_MARKET]

Slide-by-slide:
1. HOOK slide: Bold headline that makes people stop scrolling
2. "The Big Number" — median price with context
3. What this means for BUYERS
4. What this means for SELLERS
5. Inventory breakdown with visual metaphor
6. Days on market — what the speed tells us
7. Neighborhood spotlight (hottest area)
8. Prediction: what's coming next month
9. "The One Thing" — your #1 actionable tip
10. CTA slide: "Save this post" + "DM me [CITY] for a free analysis"

Requirements:
- Each slide: headline (7 words max) + body (25 words max)
- Use numbers and data points
- Include emoji sparingly (2-3 per slide max)
- Write the caption (with hashtags) separately
- Tone: authoritative but approachable`,
  },
  {
    id: 'social-2',
    title: 'TikTok/Reels Hook Scripts (5 Pack)',
    category: 'Social Media',
    preview: 'Five viral hook scripts for short-form real estate content.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: true,
    variables: [
      { key: 'CITY', label: 'City/Area', placeholder: 'Northern Virginia' },
      { key: 'NICHE', label: 'Your Niche', placeholder: 'First-time buyers in NOVA' },
    ],
    fullPrompt: `Write 5 TikTok/Instagram Reels scripts with viral hooks for a real estate agent.

Market: [CITY] | Niche: [NICHE]

For EACH of the 5 scripts:
1. HOOK (first 2 seconds — must stop the scroll)
2. BODY (15-30 seconds of content)
3. CTA (what to do next)
4. On-screen text suggestions
5. Trending audio suggestion

Script topics:
1. A surprising local market stat
2. "Things I wish I knew before buying in [CITY]"
3. A common buyer/seller myth, debunked
4. "POV: You just found out your home is worth..."
5. Neighborhood tour / hidden gem

Requirements:
- Hooks must create curiosity gaps
- Scripts should feel native to TikTok (not scripted)
- Include pattern interrupts
- Under 60 seconds each
- Tone: authentic, slightly provocative, educational`,
  },
  {
    id: 'social-3',
    title: 'LinkedIn Thought Leadership Post',
    category: 'Social Media',
    preview: 'Write a LinkedIn post that positions you as a market authority.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'TOPIC', label: 'Topic', placeholder: 'Why AI won\'t replace real estate agents' },
      { key: 'CITY', label: 'Your Market', placeholder: 'Washington DC Metro' },
      { key: 'EXPERIENCE_YEARS', label: 'Years in Business', placeholder: '12' },
    ],
    fullPrompt: `Write a LinkedIn post about [TOPIC] from the perspective of a [EXPERIENCE_YEARS]-year real estate veteran in [CITY].

Requirements:
- Hook line that stops the scroll (controversial or counter-intuitive)
- Personal story or specific example
- 3-5 key insights (use line breaks, NOT bullets)
- Each insight: one sentence, one line
- End with a question to drive comments
- Include 3-5 relevant hashtags
- Length: 150-200 words (LinkedIn sweet spot)
- Format: short lines, lots of white space
- Tone: confident, opinionated, helpful
- NO corporate jargon, NO buzzwords`,
  },
  {
    id: 'social-4',
    title: 'Instagram Story Poll Series',
    category: 'Social Media',
    preview: 'Create an engaging Instagram Story poll sequence that boosts engagement.',
    aiTools: ['ChatGPT'],
    isFree: false,
    variables: [
      { key: 'CITY', label: 'City/Area', placeholder: 'Fairfax County' },
      { key: 'TOPIC', label: 'Theme', placeholder: 'Home buying myths' },
    ],
    fullPrompt: `Create a 7-story Instagram Story sequence with interactive polls about [TOPIC] in [CITY].

For each story:
- Visual description (what's on screen)
- Text overlay (short, bold)
- Poll/Quiz/Slider sticker with options
- Correct answer reveal (next story)

Requirements:
- Story 1: Hook question (THIS or THAT poll)
- Stories 2-5: Myth vs. Fact or "Guess the price" format
- Story 6: Surprising reveal/stat
- Story 7: CTA with link sticker
- Each story must be tappable/interactive
- Use local references to [CITY]
- Tone: fun, educational, game-like`,
  },
  {
    id: 'social-5',
    title: 'Facebook Group Value Post',
    category: 'Social Media',
    preview: 'Write a value-packed Facebook post for local community groups.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'CITY', label: 'City/Area', placeholder: 'Loudoun County' },
      { key: 'TOPIC', label: 'Topic', placeholder: 'Property tax assessment appeals' },
    ],
    fullPrompt: `Write a value-first Facebook post for a local [CITY] community group about [TOPIC].

Requirements:
- NO self-promotion in the first 80% of the post
- Lead with genuinely useful information
- Include specific steps, numbers, or resources
- Add a personal touch: "I helped a neighbor with this last week..."
- Soft CTA at end: "Happy to answer questions in the comments"
- Format for Facebook: short paragraphs, emojis for visual breaks
- Length: 150-250 words
- Tone: helpful neighbor, NOT salesy agent`,
  },
  {
    id: 'social-6',
    title: 'Google Business Profile Posts (4 Pack)',
    category: 'Social Media',
    preview: 'Four GBP posts to boost your local SEO and visibility.',
    aiTools: ['ChatGPT'],
    isFree: false,
    variables: [
      { key: 'BUSINESS_NAME', label: 'Business Name', placeholder: 'Fox Homes' },
      { key: 'CITY', label: 'City/Area', placeholder: 'Northern Virginia' },
      { key: 'SPECIALTY', label: 'Your Specialty', placeholder: 'Luxury homes and first-time buyers' },
    ],
    fullPrompt: `Write 4 Google Business Profile posts for [BUSINESS_NAME] serving [CITY].

Specialty: [SPECIALTY]

Post types:
1. "What's New" — recent market update or listing
2. "Offer" — free home valuation or buyer consultation
3. "Event" — upcoming open house or webinar
4. "Update" — helpful tip or market insight

Requirements per post:
- 150-300 words (GBP sweet spot)
- Include relevant keywords naturally (for local SEO)
- CTA button text suggestion
- One post per week cadence
- Tone: professional, local, trustworthy`,
  },

  // ============ VIDEO SCRIPTS (5 prompts, 1 free) ============
  {
    id: 'video-1',
    title: 'Neighborhood Tour Video Script',
    category: 'Video Scripts',
    preview: 'Script for a 2-minute neighborhood tour video for YouTube/TikTok.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: true,
    variables: [
      { key: 'NEIGHBORHOOD', label: 'Neighborhood', placeholder: 'Mosaic District, Fairfax' },
      { key: 'TOP_RESTAURANTS', label: 'Top Restaurants', placeholder: 'Matchbox, True Food Kitchen, Red Hen' },
      { key: 'PRICE_RANGE', label: 'Home Price Range', placeholder: '$500K - $1.2M' },
      { key: 'UNIQUE_FACT', label: 'Unique Local Fact', placeholder: 'Was an old shopping center transformed in 2012' },
    ],
    fullPrompt: `Write a 2-minute neighborhood tour video script for [NEIGHBORHOOD].

Restaurants: [TOP_RESTAURANTS]
Price Range: [PRICE_RANGE]
Fun Fact: [UNIQUE_FACT]

Script Format:
HOOK (0:00-0:05): Stop-the-scroll opening line
INTRO (0:05-0:15): Quick neighborhood overview
SEGMENT 1 (0:15-0:40): The Vibe — what it feels like to live here
SEGMENT 2 (0:40-1:10): Top 3 spots (restaurants, parks, hidden gems)
SEGMENT 3 (1:10-1:35): Housing — what you get for your money
CLOSING (1:35-2:00): Who this neighborhood is PERFECT for + CTA

Requirements:
- Write for someone WALKING and TALKING to camera
- Include B-roll shot suggestions in [brackets]
- Natural, conversational language
- Local insider knowledge (not Wikipedia facts)
- End with: "Comment [NEIGHBORHOOD] and I'll send you listings"
- Tone: enthusiastic local guide, not narrator`,
  },
  {
    id: 'video-2',
    title: 'Listing Walkthrough Video Script',
    category: 'Video Scripts',
    preview: 'Professional listing tour script that sells the lifestyle.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'ADDRESS', label: 'Property Address', placeholder: '123 Main St, McLean, VA' },
      { key: 'PRICE', label: 'List Price', placeholder: '$1,450,000' },
      { key: 'BEDS_BATHS', label: 'Beds/Baths', placeholder: '5 bed / 4 bath' },
      { key: 'KEY_FEATURES', label: 'Top 3 Features', placeholder: 'Chef\'s kitchen, home theater, pool' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Write a listing walkthrough video script for [ADDRESS].

Price: [PRICE] | [BEDS_BATHS]
Top Features: [KEY_FEATURES]
Agent: [AGENT_NAME]

Script Format (2 minutes):
EXTERIOR (0:00-0:15): Curb appeal hook + address/price lower third
ENTRY (0:15-0:30): First impression moment
MAIN LIVING (0:30-0:55): Flow, light, lifestyle
KITCHEN (0:55-1:15): Details that matter to buyers
MASTER SUITE (1:15-1:35): The retreat
OUTDOOR/BONUS (1:35-1:50): Pool, yard, theater, etc.
CLOSE (1:50-2:00): Price, CTA, contact info

Requirements:
- Cinematic shot suggestions in [brackets]
- Transition phrases between rooms
- Sell the FEELING, not just features
- Include lower-third text suggestions
- Background music mood suggestion
- Tone: polished, warm, not robotic`,
  },
  {
    id: 'video-3',
    title: 'Market Update Video Script (Weekly)',
    category: 'Video Scripts',
    preview: 'Weekly 90-second market update script for social media.',
    aiTools: ['ChatGPT', 'Claude', 'Perplexity'],
    isFree: false,
    variables: [
      { key: 'CITY', label: 'Market Area', placeholder: 'Northern Virginia' },
      { key: 'WEEK', label: 'Week/Date', placeholder: 'Week of Feb 10, 2026' },
      { key: 'KEY_STAT', label: 'Key Stat', placeholder: 'Inventory dropped 12% in one week' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Write a 90-second weekly market update video script for [CITY].

Week: [WEEK]
Key Stat: [KEY_STAT]
Agent: [AGENT_NAME]

Script Format:
HOOK (0:00-0:05): "Here's what happened in [CITY] real estate this week..."
THE NUMBER (0:05-0:20): Lead with the most surprising stat
CONTEXT (0:20-0:40): What it means and why it matters
BUYER TAKE (0:40-0:55): What buyers should do right now
SELLER TAKE (0:55-1:10): What sellers should do right now
PREDICTION (1:10-1:25): What I think happens next week
CTA (1:25-1:30): Follow for weekly updates

Requirements:
- Punchy, news-anchor energy
- On-screen graphic suggestions
- Data-driven but accessible
- Include one hot take or prediction
- Tone: confident, fast-paced, authoritative`,
  },
  {
    id: 'video-4',
    title: '"Day in the Life" Agent Content Script',
    category: 'Video Scripts',
    preview: 'Behind-the-scenes content showing what agents really do.',
    aiTools: ['ChatGPT'],
    isFree: false,
    variables: [
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
      { key: 'CITY', label: 'Your Market', placeholder: 'Northern Virginia' },
      { key: 'TODAYS_AGENDA', label: "Today's Key Activity", placeholder: 'Showing 5 homes with first-time buyers' },
    ],
    fullPrompt: `Write a "Day in the Life" TikTok/Reels script for a real estate agent.

Agent: [AGENT_NAME] | Market: [CITY]
Today's Focus: [TODAYS_AGENDA]

Requirements:
- 60-90 second script
- Morning → Afternoon → Evening arc
- Mix of talking to camera + B-roll moments
- Include one relatable struggle/funny moment
- Show the glamorous AND unglamorous parts
- Text overlay suggestions for each scene
- End with an authentic, unscripted-feeling moment
- Trending audio suggestion
- Tone: authentic, relatable, aspirational`,
  },
  {
    id: 'video-5',
    title: 'YouTube Shorts: Real Estate Myth Buster',
    category: 'Video Scripts',
    preview: 'Debunk common real estate myths in under 60 seconds.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'MYTH', label: 'The Myth', placeholder: 'You need 20% down to buy a home' },
      { key: 'CITY', label: 'Your Market', placeholder: 'Virginia' },
    ],
    fullPrompt: `Write a YouTube Shorts myth-busting script about: "[MYTH]"

Market context: [CITY]

Script format (under 60 seconds):
HOOK (0:00-0:03): "Stop believing this lie about buying a home..."
THE MYTH (0:03-0:10): State it clearly
THE TRUTH (0:10-0:35): Debunk with specific data/examples
THE PROOF (0:35-0:50): Real example or stat from [CITY]
CTA (0:50-0:58): "Follow for more — what myth should I bust next?"

Requirements:
- Pattern interrupt in first 2 seconds
- Use local data when possible
- On-screen text for key stats
- Confrontational but educational
- Include pinned comment suggestion
- Tone: "let me save you from bad advice"`,
  },

  // ============ MARKET ANALYSIS (5 prompts, 1 free) ============
  {
    id: 'market-1',
    title: 'CMA Narrative Summary',
    category: 'Market Analysis',
    preview: 'Turn raw CMA data into a compelling pricing story for sellers.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: true,
    variables: [
      { key: 'ADDRESS', label: 'Subject Property', placeholder: '123 Oak St, Vienna, VA' },
      { key: 'SUGGESTED_PRICE', label: 'Suggested List Price', placeholder: '$825,000' },
      { key: 'COMP_1', label: 'Comp 1 (Address, Price, Status)', placeholder: '120 Oak St - $810K - Sold 12/2025' },
      { key: 'COMP_2', label: 'Comp 2 (Address, Price, Status)', placeholder: '130 Elm Ave - $840K - Sold 01/2026' },
      { key: 'COMP_3', label: 'Comp 3 (Address, Price, Status)', placeholder: '145 Oak St - $795K - Active' },
    ],
    fullPrompt: `Write a CMA narrative summary I can present to a seller.

Subject Property: [ADDRESS]
Suggested List Price: [SUGGESTED_PRICE]

Comparables:
1. [COMP_1]
2. [COMP_2]
3. [COMP_3]

Requirements:
- Open with the market context (buyer's/seller's, trends)
- Explain each comp and why it's relevant (or how subject differs)
- Build the case for your suggested price logically
- Address potential objections ("My Zestimate says...")
- Include a "pricing strategy" recommendation (at/above/below market)
- Explain what happens if they overprice (DOM data, stigma)
- Close with confidence in the price
- Length: 400-500 words
- Tone: data-driven but conversational, like explaining to a friend`,
  },
  {
    id: 'market-2',
    title: 'Hyperlocal Market Report',
    category: 'Market Analysis',
    preview: 'Deep-dive market report for a specific neighborhood or zip code.',
    aiTools: ['Perplexity', 'ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'NEIGHBORHOOD', label: 'Neighborhood/Zip', placeholder: 'Reston 20190' },
      { key: 'TIMEFRAME', label: 'Timeframe', placeholder: 'Last 6 months' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Create a hyperlocal market report for [NEIGHBORHOOD] over [TIMEFRAME].

Agent: [AGENT_NAME]

Include these sections:
1. EXECUTIVE SUMMARY (3 sentences)
2. KEY METRICS: Median price, DOM, list-to-sale ratio, inventory
3. PRICE TRENDS: Month-over-month and year-over-year
4. BUYER DEMAND: Multiple offers? Cash deals? Waived contingencies?
5. INVENTORY ANALYSIS: What's available, what's moving fastest
6. DEVELOPMENT/ZONING: Any new construction or changes coming?
7. SCHOOL DISTRICT IMPACT: How schools affect pricing here
8. 90-DAY FORECAST: What I expect to happen next
9. BOTTOM LINE: Is it a good time to buy/sell here?

Requirements:
- Use data placeholders where I need to fill in real numbers
- Write for homeowners, not economists
- Include one chart/graph description I should create
- Add a "share-worthy" stat for social media
- Length: 600-800 words
- Tone: local expert, data-backed opinions`,
  },
  {
    id: 'market-3',
    title: 'Rental vs. Buy Analysis',
    category: 'Market Analysis',
    preview: 'Create a rent vs. buy comparison for a specific area.',
    aiTools: ['ChatGPT', 'Claude', 'Perplexity'],
    isFree: false,
    variables: [
      { key: 'CITY', label: 'City/Area', placeholder: 'Arlington, VA' },
      { key: 'AVG_RENT', label: 'Average 2BR Rent', placeholder: '$2,800/mo' },
      { key: 'MEDIAN_PRICE', label: 'Median Condo Price', placeholder: '$525,000' },
      { key: 'INTEREST_RATE', label: 'Current Rate', placeholder: '6.5%' },
    ],
    fullPrompt: `Create a rent vs. buy analysis for [CITY].

Average 2BR Rent: [AVG_RENT]
Median Condo Price: [MEDIAN_PRICE]
Current Mortgage Rate: [INTEREST_RATE]

Include:
1. Monthly cost comparison (rent vs. PITI + HOA)
2. 5-year wealth building comparison
3. Break-even timeline
4. Tax benefit considerations
5. Lifestyle factors unique to [CITY]
6. "The real math" — total cost of each over 5 years
7. Clear recommendation based on different scenarios

Requirements:
- Use actual calculations (show the math)
- Address the "renting is throwing money away" myth
- Be honest — sometimes renting IS better
- Include a simple decision matrix
- Length: 400-600 words
- Tone: financial advisor, not salesperson`,
  },
  {
    id: 'market-4',
    title: 'New Construction Market Comparison',
    category: 'Market Analysis',
    preview: 'Compare new construction vs. resale in a specific market.',
    aiTools: ['ChatGPT', 'Perplexity'],
    isFree: false,
    variables: [
      { key: 'CITY', label: 'City/Area', placeholder: 'Loudoun County, VA' },
      { key: 'BUILDER', label: 'Builder Name', placeholder: 'Toll Brothers' },
      { key: 'NEW_PRICE', label: 'New Construction Price', placeholder: '$750,000' },
      { key: 'RESALE_PRICE', label: 'Comparable Resale Price', placeholder: '$680,000' },
    ],
    fullPrompt: `Write a new construction vs. resale comparison for buyers in [CITY].

Builder: [BUILDER]
New Construction: [NEW_PRICE]
Comparable Resale: [RESALE_PRICE]

Include:
1. Price per square foot comparison
2. Hidden costs of new construction (lot premiums, upgrades, landscaping)
3. Hidden costs of resale (repairs, updates, inspections)
4. Timeline comparison (build wait vs. move-in ready)
5. Negotiation leverage differences
6. Appreciation potential for each
7. Warranty and maintenance differences
8. Recommendation for different buyer types

Requirements:
- Be balanced — show pros/cons of BOTH
- Include specific dollar amounts where possible
- Address the "everything is new" emotional appeal
- Length: 400-500 words
- Tone: honest advisor`,
  },
  {
    id: 'market-5',
    title: 'Interest Rate Impact Explainer',
    category: 'Market Analysis',
    preview: 'Explain how rate changes affect buying power in your market.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'CURRENT_RATE', label: 'Current Rate', placeholder: '6.75%' },
      { key: 'PREVIOUS_RATE', label: 'Rate 6 Months Ago', placeholder: '7.25%' },
      { key: 'HOME_PRICE', label: 'Typical Home Price', placeholder: '$600,000' },
    ],
    fullPrompt: `Write a client-friendly explanation of how interest rate changes affect home buying.

Current Rate: [CURRENT_RATE]
Rate 6 Months Ago: [PREVIOUS_RATE]
Typical Home Price in Area: [HOME_PRICE]

Include:
1. Monthly payment difference between the two rates
2. Total interest paid over 30 years (both scenarios)
3. How much MORE home they can afford at the lower rate
4. "Rate buy-down" strategy explanation
5. "Marry the house, date the rate" argument
6. When refinancing makes sense
7. What the Fed is signaling for future rates

Requirements:
- Use real math with the numbers provided
- Make it feel empowering, not scary
- Include a visual-friendly comparison table description
- Length: 300-400 words
- Tone: patient teacher, not lecture`,
  },

  // ============ CLIENT COMMUNICATION (5 prompts, 2 free) ============
  {
    id: 'client-1',
    title: 'Listing Presentation Talking Points',
    category: 'Client Communication',
    preview: 'Key talking points for a seller listing appointment.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: true,
    variables: [
      { key: 'SELLER_NAME', label: 'Seller Name', placeholder: 'The Johnsons' },
      { key: 'ADDRESS', label: 'Property Address', placeholder: '456 Maple Ave, Falls Church, VA' },
      { key: 'ESTIMATED_VALUE', label: 'Estimated Value', placeholder: '$725,000' },
      { key: 'YOUR_DIFFERENTIATOR', label: 'Your Key Differentiator', placeholder: 'We use AI-powered marketing and average 8 days on market' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Create listing presentation talking points for a meeting with [SELLER_NAME].

Property: [ADDRESS] | Est. Value: [ESTIMATED_VALUE]
My Differentiator: [YOUR_DIFFERENTIATOR]
Agent: [AGENT_NAME]

Create talking points for these sections:
1. OPENER (build rapport, show you've done homework)
2. MARKET OVERVIEW (local stats, what's happening)
3. PRICING STRATEGY (data-driven recommendation)
4. MARKETING PLAN (what you'll do that others won't)
5. TIMELINE (what to expect week by week)
6. OBJECTION HANDLING (commission, competing agents, FSBO)
7. CLOSE (ask for the business confidently)

Requirements:
- Bullet points, not paragraphs (these are TALKING points)
- Include 2-3 specific stats or facts per section
- Anticipate their concerns before they raise them
- Include a "mic drop" moment for your differentiator
- Natural, confident language
- Tone: prepared professional, not rehearsed robot`,
  },
  {
    id: 'client-2',
    title: 'Offer Rejection Consolation Message',
    category: 'Client Communication',
    preview: 'Comfort a buyer whose offer was rejected and keep them motivated.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: true,
    variables: [
      { key: 'BUYER_NAME', label: 'Buyer Name', placeholder: 'Sarah' },
      { key: 'ADDRESS', label: 'Property They Lost', placeholder: '789 Elm St, Fairfax, VA' },
      { key: 'REASON', label: 'Why They Lost', placeholder: 'Seller went with a cash offer' },
    ],
    fullPrompt: `Write a text/email to a buyer whose offer was just rejected.

Buyer: [BUYER_NAME]
Property: [ADDRESS]
Reason: [REASON]

Requirements:
- Acknowledge their disappointment (don't minimize it)
- Brief explanation of why without placing blame
- Reframe: "This wasn't your house, and here's why that's okay"
- Share a story of a client who found something better after a loss
- Immediate next step: "I already have 2 properties to show you"
- Keep under 150 words (this is a text, not an essay)
- Tone: empathetic coach, not "everything happens for a reason" platitudes`,
  },
  {
    id: 'client-3',
    title: 'Inspection Results Summary for Buyers',
    category: 'Client Communication',
    preview: 'Translate a home inspection report into plain English for your buyers.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'BUYER_NAME', label: 'Buyer Name', placeholder: 'Mike and Lisa' },
      { key: 'ADDRESS', label: 'Property', placeholder: '123 Oak Ct, Burke, VA' },
      { key: 'MAJOR_ISSUES', label: 'Major Issues Found', placeholder: 'HVAC is 18 years old, minor foundation crack, outdated electrical panel' },
      { key: 'MINOR_ISSUES', label: 'Minor Issues', placeholder: 'Caulking, loose handrail, dripping faucet' },
    ],
    fullPrompt: `Write a client-friendly inspection summary for [BUYER_NAME].

Property: [ADDRESS]
Major Issues: [MAJOR_ISSUES]
Minor Issues: [MINOR_ISSUES]

Include:
1. OVERVIEW: "Here's what the inspector found — and what it actually means"
2. RED FLAGS (need to address before closing):
   - Each issue explained in plain English
   - Estimated repair cost range
   - Recommendation: ask seller to fix, credit, or accept
3. YELLOW FLAGS (monitor but not deal-breakers):
   - What to watch over the next 1-2 years
4. GREEN FLAGS (things that looked good):
   - Highlight positives to balance the scary stuff
5. MY RECOMMENDATION: Overall assessment + negotiation strategy

Requirements:
- NO inspector jargon
- Honest but not alarming
- Frame as negotiation leverage, not reasons to walk away
- Length: 300-400 words
- Tone: trusted advisor translating the technical stuff`,
  },
  {
    id: 'client-4',
    title: 'Closing Day Congratulations + Next Steps',
    category: 'Client Communication',
    preview: 'Post-closing message with congratulations and helpful next steps.',
    aiTools: ['ChatGPT'],
    isFree: false,
    variables: [
      { key: 'CLIENT_NAME', label: 'Client Name', placeholder: 'The Martinez Family' },
      { key: 'ADDRESS', label: 'New Address', placeholder: '456 Willow Dr, Reston, VA' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Write a closing day congratulations message with practical next steps.

Client: [CLIENT_NAME]
New Home: [ADDRESS]
Agent: [AGENT_NAME]

Include:
1. Heartfelt congratulations (make it personal, not template-y)
2. FIRST WEEK checklist:
   - Change locks
   - Update address (USPS, banks, subscriptions)
   - Set up utilities
   - Meet the neighbors
3. FIRST MONTH reminders:
   - File homestead exemption
   - Set up home warranty claims process
   - Schedule HVAC maintenance
4. Ongoing: "I'm always here" — how to reach you for questions
5. Referral ask (soft): "If any friends mention real estate..."
6. Gift mention if applicable

Requirements:
- Make them feel celebrated
- Practical value they'll actually use
- Length: 200-300 words
- Tone: warm friend who just helped you with a huge life milestone`,
  },
  {
    id: 'client-5',
    title: 'Price Reduction Conversation Script',
    category: 'Client Communication',
    preview: 'How to have the tough price reduction talk with a seller.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'SELLER_NAME', label: 'Seller Name', placeholder: 'Tom' },
      { key: 'CURRENT_PRICE', label: 'Current List Price', placeholder: '$850,000' },
      { key: 'SUGGESTED_PRICE', label: 'Suggested New Price', placeholder: '$799,000' },
      { key: 'DAYS_ON_MARKET', label: 'Days on Market', placeholder: '28' },
      { key: 'SHOWINGS', label: 'Number of Showings', placeholder: '6' },
      { key: 'FEEDBACK', label: 'Common Showing Feedback', placeholder: 'Love the house but feel it\'s overpriced for the area' },
    ],
    fullPrompt: `Write a script for having a price reduction conversation with a seller.

Seller: [SELLER_NAME]
Current Price: [CURRENT_PRICE] → Suggested: [SUGGESTED_PRICE]
DOM: [DAYS_ON_MARKET] | Showings: [SHOWINGS]
Feedback: [FEEDBACK]

Script sections:
1. OPENING: Empathize, don't apologize
2. THE DATA: Present market evidence matter-of-factly
3. THE FEEDBACK: Share buyer/agent feedback themes
4. THE COST OF WAITING: What another 30 days at this price costs them
5. THE STRATEGY: Why the new price will create urgency
6. OBJECTION RESPONSES:
   - "But our neighbor's sold for more"
   - "Let's just wait for spring"
   - "Can we try a smaller reduction?"
   - "Maybe we should switch agents"
7. THE ASK: Confident close

Requirements:
- This is a CONVERSATION script, not a monologue
- Include pauses for seller responses
- Never badmouth the property
- Use "we" language: "we need to adjust our strategy"
- Tone: empathetic but firm, data-driven`,
  },

  // ============ SEO/AEO (5 prompts, 1 free) ============
  {
    id: 'seo-1',
    title: 'Neighborhood SEO Blog Post',
    category: 'SEO/AEO',
    preview: 'Write an SEO-optimized neighborhood guide that ranks on Google.',
    aiTools: ['ChatGPT', 'Claude', 'Perplexity'],
    isFree: true,
    variables: [
      { key: 'NEIGHBORHOOD', label: 'Neighborhood', placeholder: 'Tysons Corner, VA' },
      { key: 'TARGET_KEYWORD', label: 'Target Keyword', placeholder: 'living in Tysons Corner VA' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Write a 2,000-word SEO-optimized neighborhood guide about [NEIGHBORHOOD].

Target Keyword: [TARGET_KEYWORD]
Author: [AGENT_NAME]

Structure:
1. H1: [Craft an engaging title using the target keyword]
2. INTRO (150 words): Hook + keyword in first paragraph
3. H2: What's It Like Living in [NEIGHBORHOOD]?
4. H2: Cost of Living & Home Prices
5. H2: Best Restaurants & Dining
6. H2: Schools & Education
7. H2: Parks & Recreation
8. H2: Commute & Transportation
9. H2: Pros and Cons of Living in [NEIGHBORHOOD]
10. H2: FAQ (5 questions in schema-markup-ready format)
11. CONCLUSION: CTA to contact you

SEO Requirements:
- Use target keyword 8-12 times naturally
- Include 5-8 LSI keywords
- Internal link placeholders: [LINK: related neighborhood]
- Meta title (60 chars) and meta description (155 chars)
- Alt text suggestions for 3-4 images
- Featured snippet-optimized FAQ section
- Tone: local expert who actually lives/works there`,
  },
  {
    id: 'seo-2',
    title: 'AEO-Optimized FAQ Page',
    category: 'SEO/AEO',
    preview: 'Create AI-Engine-Optimized FAQ content for your website.',
    aiTools: ['ChatGPT', 'Claude', 'Perplexity'],
    isFree: false,
    variables: [
      { key: 'CITY', label: 'City/Area', placeholder: 'Northern Virginia' },
      { key: 'AGENT_NAME', label: 'Your Name/Brand', placeholder: 'Fox Homes' },
      { key: 'SPECIALTY', label: 'Your Specialty', placeholder: 'Luxury homes and relocations' },
    ],
    fullPrompt: `Create an AEO (AI Engine Optimization) FAQ page for [AGENT_NAME] serving [CITY].

Specialty: [SPECIALTY]

Write 15 FAQ entries optimized for AI search engines (ChatGPT, Perplexity, Google AI Overview):

Categories:
- Buying in [CITY] (5 questions)
- Selling in [CITY] (5 questions)
- [CITY] Market & Lifestyle (5 questions)

For EACH question:
1. Question (natural language, how people actually ask)
2. Concise answer (2-3 sentences — this is what AI will cite)
3. Expanded answer (2-3 paragraphs for the full page)
4. Schema markup type (FAQPage, HowTo, etc.)

AEO Requirements:
- Questions should match voice search patterns
- Answers should be self-contained (AI can excerpt them)
- Include your brand name naturally in 30% of answers
- Cite specific data points AI engines love
- Structured data recommendations
- Tone: authoritative, concise, quotable`,
  },
  {
    id: 'seo-3',
    title: 'Google Business Profile Optimization',
    category: 'SEO/AEO',
    preview: 'Optimize your GBP description and posts for local search.',
    aiTools: ['ChatGPT', 'Perplexity'],
    isFree: false,
    variables: [
      { key: 'BUSINESS_NAME', label: 'Business Name', placeholder: 'Fox Homes - Dustin Fox' },
      { key: 'CITY', label: 'Primary City', placeholder: 'Northern Virginia' },
      { key: 'SERVICES', label: 'Services', placeholder: 'Buyer representation, seller representation, relocations, investment properties' },
      { key: 'AWARDS', label: 'Awards/Credentials', placeholder: 'Top 1% Realtor, 500+ homes sold' },
    ],
    fullPrompt: `Optimize my Google Business Profile for local SEO.

Business: [BUSINESS_NAME]
Area: [CITY]
Services: [SERVICES]
Credentials: [AWARDS]

Create:
1. BUSINESS DESCRIPTION (750 chars max):
   - Front-load with city + service keywords
   - Include credentials
   - Natural, not keyword-stuffed

2. SERVICES LIST (10 services with descriptions):
   - Each: service name + 2-sentence description
   - Location keywords in each

3. Q&A SEEDING (10 questions to self-post):
   - Questions people search for
   - Concise, helpful answers

4. REVIEW RESPONSE TEMPLATES (5):
   - 5-star thank you (include keywords)
   - 4-star appreciation
   - 3-star professional response
   - Generic positive
   - Negative review (de-escalation)

Requirements:
- Every piece should include location keywords naturally
- Match actual search queries in your area
- Tone: professional, local, trustworthy`,
  },
  {
    id: 'seo-4',
    title: 'Blog Post: "Best [X] in [City]" Listicle',
    category: 'SEO/AEO',
    preview: 'SEO listicle targeting "best neighborhoods/restaurants/schools in [city]".',
    aiTools: ['ChatGPT', 'Perplexity'],
    isFree: false,
    variables: [
      { key: 'TOPIC', label: 'Listicle Topic', placeholder: 'neighborhoods for families' },
      { key: 'CITY', label: 'City', placeholder: 'Fairfax County, VA' },
      { key: 'COUNT', label: 'Number of Items', placeholder: '10' },
    ],
    fullPrompt: `Write an SEO-optimized listicle: "Best [TOPIC] in [CITY]" with [COUNT] entries.

For each entry include:
1. Name/Title
2. Why it made the list (3-4 sentences)
3. Key stats or data point
4. Who it's best for
5. Insider tip from a local

SEO Requirements:
- H2 for each entry
- Target keyword in title, intro, 3+ H2s
- Meta title + description
- Internal link opportunities
- FAQ section (5 questions)
- 1,500-2,000 words total
- Featured snippet format for the intro
- Tone: knowledgeable local, not Wikipedia`,
  },
  {
    id: 'seo-5',
    title: 'AI Overview / Featured Snippet Optimizer',
    category: 'SEO/AEO',
    preview: 'Rewrite existing content to win Google AI Overviews and featured snippets.',
    aiTools: ['Claude', 'ChatGPT'],
    isFree: false,
    variables: [
      { key: 'EXISTING_CONTENT', label: 'Paste Your Existing Content', placeholder: 'Paste your blog post or page content here...' },
      { key: 'TARGET_QUERY', label: 'Target Search Query', placeholder: 'how much does it cost to buy a house in Arlington VA' },
    ],
    fullPrompt: `Rewrite/optimize this content to win the Google AI Overview and featured snippet for: "[TARGET_QUERY]"

EXISTING CONTENT:
[EXISTING_CONTENT]

Optimization tasks:
1. Add a 2-3 sentence direct answer at the top (snippet-bait)
2. Restructure with clear H2/H3 hierarchy
3. Add a comparison table if applicable
4. Create a "quick answer" box format
5. Add step-by-step formatting where relevant
6. Include "People also ask" questions as H2s
7. Ensure every section is self-contained (AI can excerpt it)
8. Add schema markup recommendations

Requirements:
- Keep the original voice and expertise
- Don't add fluff — tighten, don't expand
- Front-load answers before explanations
- Tone: same as original but more structured`,
  },

  // ============ LEAD GENERATION (5 prompts, 2 free) ============
  {
    id: 'lead-1',
    title: 'Lead Magnet: Homebuyer Guide Outline',
    category: 'Lead Generation',
    preview: 'Create a downloadable homebuyer guide that captures leads.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: true,
    variables: [
      { key: 'CITY', label: 'City/Area', placeholder: 'Northern Virginia' },
      { key: 'YEAR', label: 'Year', placeholder: '2026' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Create the full content outline for a "[YEAR] [CITY] Homebuyer Guide" lead magnet.

Author: [AGENT_NAME]

Structure (aim for 20-25 pages when designed):
1. COVER PAGE: Title, subtitle, agent branding
2. INTRO: "Why I Created This Guide" (personal, builds trust)
3. CHAPTER 1: The [CITY] Market Right Now (stats + what they mean)
4. CHAPTER 2: How Much Home Can You Actually Afford? (calculator walkthrough)
5. CHAPTER 3: The Home Buying Process (step-by-step timeline)
6. CHAPTER 4: Neighborhoods Guide (top 5 areas with price ranges)
7. CHAPTER 5: Mortgage 101 (types, rates, pre-approval)
8. CHAPTER 6: Making an Offer That Wins
9. CHAPTER 7: Inspection & Closing Explained
10. CHAPTER 8: First-Time Buyer Programs in [CITY]
11. RESOURCE PAGE: Lender recs, moving checklist, utility setup
12. ABOUT THE AGENT: Your bio, testimonials, CTA

For each chapter, write:
- Chapter title
- 3-4 key points to cover
- One "aha moment" stat or insight
- CTA within the chapter (subtle)

Requirements:
- Content should be genuinely useful (not a sales pitch disguised as a guide)
- Include [CITY]-specific data throughout
- Tone: trusted advisor writing for a friend`,
  },
  {
    id: 'lead-2',
    title: 'Facebook/Instagram Ad Copy (5 Variations)',
    category: 'Lead Generation',
    preview: 'Five ad copy variations for real estate lead generation campaigns.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: true,
    variables: [
      { key: 'CITY', label: 'Target Area', placeholder: 'Fairfax County, VA' },
      { key: 'TARGET_AUDIENCE', label: 'Target Audience', placeholder: 'First-time buyers, ages 28-40' },
      { key: 'OFFER', label: 'Lead Magnet/Offer', placeholder: 'Free 2026 Homebuyer Guide' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Write 5 Facebook/Instagram ad copy variations for lead generation.

Target: [TARGET_AUDIENCE] in [CITY]
Offer: [OFFER]
Agent: [AGENT_NAME]

For EACH variation:
1. Primary text (above the fold — 125 chars for mobile)
2. Extended text (full ad copy — 200-300 words)
3. Headline (40 chars max)
4. Description (30 chars max)
5. CTA button suggestion

Variation angles:
1. FEAR OF MISSING OUT: Market urgency
2. MONEY SAVINGS: Financial angle
3. INSIDER KNOWLEDGE: "What agents won't tell you"
4. SOCIAL PROOF: Testimonial/results-based
5. QUESTION HOOK: Problem-aware targeting

Requirements:
- Each ad should feel completely different
- Include pattern interrupts (questions, bold claims)
- Speak to emotional triggers, not features
- Tone: varies per ad (urgent, friendly, provocative, warm, curious)`,
  },
  {
    id: 'lead-3',
    title: 'Seller Lead Magnet: "What\'s My Home Worth?" Landing Page',
    category: 'Lead Generation',
    preview: 'Copy for a high-converting home valuation landing page.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'CITY', label: 'City/Area', placeholder: 'Northern Virginia' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
      { key: 'HOMES_SOLD', label: 'Homes Sold', placeholder: '500+' },
    ],
    fullPrompt: `Write landing page copy for a "What's My Home Worth?" lead capture page.

Market: [CITY]
Agent: [AGENT_NAME] | [HOMES_SOLD] homes sold

Sections:
1. HERO: Headline + subheadline + form
2. SOCIAL PROOF BAR: Key stats (homes sold, avg above asking, etc.)
3. HOW IT WORKS: 3 simple steps
4. WHY OUR ESTIMATES: What makes yours different from Zestimate
5. TESTIMONIALS: Template for 3 client quotes
6. FAQ: 4 common questions
7. FINAL CTA: Urgency-driven close

Requirements:
- Headline options (3): benefit-driven, not "Get a Free CMA"
- Form fields: just address + email (low friction)
- Address Zestimate objection directly
- Include trust indicators (stats, logos, reviews)
- Mobile-first design notes
- Length: 500-700 words total
- Tone: professional, data-confident, trustworthy`,
  },
  {
    id: 'lead-4',
    title: 'Referral Request Email Sequence',
    category: 'Lead Generation',
    preview: 'Three-email sequence asking past clients for referrals naturally.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'CLIENT_NAME', label: 'Past Client Name', placeholder: 'Jennifer' },
      { key: 'TRANSACTION_TYPE', label: 'What You Helped With', placeholder: 'Bought their first home in Reston' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Write a 3-email referral request sequence for past clients.

Client: [CLIENT_NAME]
Transaction: [TRANSACTION_TYPE]
Agent: [AGENT_NAME]

EMAIL 1 (Value-First — no ask):
- Share something useful (market update, home maintenance tip)
- Check in on how they're enjoying the home
- NO referral ask yet

EMAIL 2 (Soft Ask — 1 week later):
- Reference a recent success story
- "You might know someone..." positioning
- Make it easy: "Just reply with their name"

EMAIL 3 (Direct Ask — 2 weeks later):
- Be direct and confident about asking
- Explain your referral process
- Offer a small thank-you gesture
- Include exact words they can use to introduce you

Requirements:
- Each email under 150 words
- Never make them feel used
- The sequence should feel like catching up, not campaigning
- Tone: warm, appreciative, never desperate`,
  },
  {
    id: 'lead-5',
    title: 'Zillow/Realtor.com Lead Response Scripts',
    category: 'Lead Generation',
    preview: 'Speed-to-lead response templates for portal inquiries.',
    aiTools: ['ChatGPT'],
    isFree: false,
    variables: [
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
      { key: 'CITY', label: 'Your Market', placeholder: 'Northern Virginia' },
    ],
    fullPrompt: `Write speed-to-lead response scripts for Zillow/Realtor.com inquiries.

Agent: [AGENT_NAME] | Market: [CITY]

Create responses for these scenarios:

1. PROPERTY INQUIRY (they asked about a specific listing):
   - Text response (under 50 words)
   - Email response (under 100 words)
   - Voicemail script (under 30 seconds)

2. GENERAL SEARCH (just browsing):
   - Text response
   - Email response
   - Voicemail script

3. PRE-APPROVAL QUESTION:
   - Text response
   - Email response

4. NO RESPONSE FOLLOW-UP (Day 2, Day 5, Day 14):
   - 3 follow-up texts (escalating value, not pressure)

Requirements:
- First response must be sendable within 60 seconds
- Ask ONE question (not interrogate)
- Provide value immediately
- Never say "Are you still interested?"
- Tone: helpful, casual, like texting a friend`,
  },

  // ============ OPEN HOUSES (5 prompts, 1 free) ============
  {
    id: 'oh-1',
    title: 'Open House Social Media Blast',
    category: 'Open Houses',
    preview: 'Multi-platform social media content for your upcoming open house.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: true,
    variables: [
      { key: 'ADDRESS', label: 'Property Address', placeholder: '123 Main St, Vienna, VA' },
      { key: 'DATE_TIME', label: 'Date & Time', placeholder: 'Saturday, Feb 15 from 1-4pm' },
      { key: 'PRICE', label: 'List Price', placeholder: '$875,000' },
      { key: 'HERO_FEATURE', label: 'Hero Feature', placeholder: 'Stunning renovated kitchen with 10ft island' },
      { key: 'BEDS_BATHS', label: 'Beds/Baths', placeholder: '4 bed / 3.5 bath' },
    ],
    fullPrompt: `Create a multi-platform social media blitz for my open house.

Property: [ADDRESS] | [BEDS_BATHS] | [PRICE]
Date/Time: [DATE_TIME]
Hero Feature: [HERO_FEATURE]

Create posts for:
1. INSTAGRAM POST: Caption + 30 hashtags + story sequence (3 slides)
2. FACEBOOK POST: Shareable, neighborhood-focused angle
3. FACEBOOK EVENT: Title, description, details
4. INSTAGRAM STORY: 5-story countdown sequence (day before)
5. NEXTDOOR POST: Neighbor-friendly, community angle
6. TIKTOK: 15-second teaser script

Requirements:
- Each platform should have a DIFFERENT angle (not copy-paste)
- Include address and time in every post
- Use FOMO and exclusivity language
- Hashtag strategy: 10 local + 10 real estate + 10 lifestyle
- Tone: exciting, welcoming, "you have to see this"`,
  },
  {
    id: 'oh-2',
    title: 'Open House Sign-In Follow-Up Sequence',
    category: 'Open Houses',
    preview: 'Automated follow-up sequence for every open house visitor.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'ADDRESS', label: 'Open House Address', placeholder: '123 Main St, Vienna, VA' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
      { key: 'PRICE', label: 'List Price', placeholder: '$875,000' },
    ],
    fullPrompt: `Create a complete open house follow-up sequence.

Property: [ADDRESS] | Price: [PRICE]
Agent: [AGENT_NAME]

Sequence:
1. SAME DAY TEXT (within 2 hours of leaving):
   - Thank them, reference something specific
   - Ask one qualifying question

2. NEXT DAY EMAIL:
   - Full property details + photos link
   - 2-3 similar listings
   - CTA: schedule private showing

3. DAY 3 TEXT:
   - Market insight about the neighborhood
   - "Any questions I can answer?"

4. DAY 7 EMAIL:
   - Value-add content (neighborhood guide, market report)
   - Soft pitch: "What's your timeline?"

5. DAY 14 TEXT (if no response):
   - New listing alert in same area
   - Last touch before moving to nurture

6. NOSY NEIGHBOR response (they live nearby, not buying):
   - Different track: home value offer
   - "Curious what your home is worth?"

Requirements:
- Each message < 100 words
- Personalization tokens: [NAME], [PROPERTY THEY ASKED ABOUT]
- Never be pushy
- Tone: helpful, not desperate`,
  },
  {
    id: 'oh-3',
    title: 'Mega Open House Event Plan',
    category: 'Open Houses',
    preview: 'Plan a community-event style open house that generates 50+ leads.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'ADDRESS', label: 'Property Address', placeholder: '456 Oak Ave, McLean, VA' },
      { key: 'PRICE', label: 'List Price', placeholder: '$1,400,000' },
      { key: 'BUDGET', label: 'Event Budget', placeholder: '$500' },
      { key: 'DATE', label: 'Event Date', placeholder: 'Saturday, March 1st' },
    ],
    fullPrompt: `Plan a mega open house event that goes beyond the standard open house.

Property: [ADDRESS] | Price: [PRICE]
Budget: [BUDGET] | Date: [DATE]

Create a complete plan:
1. EVENT CONCEPT: Theme that matches the property
2. VENDOR PARTNERSHIPS: Local businesses to invite (food, coffee, etc.)
3. ENTERTAINMENT: Live music, activities, kids' corner
4. MARKETING TIMELINE:
   - 2 weeks out: social media teasers
   - 1 week out: email blast + ads
   - Day of: live content plan
5. LEAD CAPTURE STRATEGY:
   - Digital sign-in with QR code
   - Raffle entry requiring contact info
   - Instagram follow incentive
6. SIGNAGE & WAYFINDING: What signs, where
7. DAY-OF SCHEDULE: Hour by hour
8. FOLLOW-UP PLAN: Post-event sequence

Requirements:
- Think "community event" not "open house"
- Every element should capture leads
- Include social media content plan for the event
- Budget breakdown for all items
- Tone: event planner meets real estate strategist`,
  },
  {
    id: 'oh-4',
    title: 'Open House Talking Points by Room',
    category: 'Open Houses',
    preview: 'Room-by-room talking points so you never fumble during a showing.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'ADDRESS', label: 'Property Address', placeholder: '789 Elm Dr, Fairfax, VA' },
      { key: 'KEY_FEATURES', label: 'Key Features by Area', placeholder: 'Kitchen: quartz counters, Wolf range. Master: spa bath. Yard: mature trees, patio.' },
      { key: 'NEIGHBORHOOD_HIGHLIGHTS', label: 'Neighborhood Highlights', placeholder: 'Walk to elementary school, 5 min to Mosaic District' },
    ],
    fullPrompt: `Create room-by-room open house talking points.

Property: [ADDRESS]
Features: [KEY_FEATURES]
Neighborhood: [NEIGHBORHOOD_HIGHLIGHTS]

For each area (Entry, Living, Kitchen, Dining, Master, Yard/Outdoor, Neighborhood):
1. OPENING LINE: First thing to say when they walk in
2. FEATURE CALLOUT: What to physically point to
3. LIFESTYLE SELL: How they'd USE this space
4. OBJECTION PREEMPT: Address the obvious concern before they raise it
5. TRANSITION: Natural segue to the next room

Also include:
- 5 most common visitor questions + answers
- How to handle "What's the lowest they'll take?"
- Neighbor/school talking points
- Exit conversation: how to close and get contact info

Requirements:
- Conversational, not robotic
- Include body language tips
- Tone: confident host at a dinner party`,
  },
  {
    id: 'oh-5',
    title: 'Broker Open House Invitation',
    category: 'Open Houses',
    preview: 'Email invitation to agents for a broker open house that actually gets attendance.',
    aiTools: ['ChatGPT'],
    isFree: false,
    variables: [
      { key: 'ADDRESS', label: 'Property Address', placeholder: '321 Birch Ln, Great Falls, VA' },
      { key: 'PRICE', label: 'List Price', placeholder: '$2,100,000' },
      { key: 'DATE_TIME', label: 'Date & Time', placeholder: 'Tuesday, Feb 18 from 11am-1pm' },
      { key: 'CATERING', label: 'Food/Drink', placeholder: 'Catered lunch from Local Restaurant' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Write a broker open house invitation email that agents actually show up to.

Property: [ADDRESS] | [PRICE]
Date/Time: [DATE_TIME]
Catering: [CATERING]
Host: [AGENT_NAME]

Requirements:
- Subject line that stands out in agent inboxes
- Lead with the food (let's be honest)
- Property highlights that matter to AGENTS (commission, showing ease, buyer demand)
- Include a "bring a buyer" incentive if applicable
- Quick-glance format: specs, time, food, directions
- RSVP mechanism
- Keep under 200 words
- Tone: colleague-to-colleague, professional but fun`,
  },

  // ============ BUYER/SELLER PRESENTATIONS (5 prompts, 1 free) ============
  {
    id: 'pres-1',
    title: 'Buyer Consultation Presentation Outline',
    category: 'Buyer/Seller Presentations',
    preview: 'Structure a buyer consultation that converts leads into clients.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: true,
    variables: [
      { key: 'BUYER_NAME', label: 'Buyer Name', placeholder: 'Sarah & Mike' },
      { key: 'CITY', label: 'Target Area', placeholder: 'Northern Virginia' },
      { key: 'BUDGET', label: 'Budget Range', placeholder: '$500,000 - $650,000' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
      { key: 'DIFFERENTIATOR', label: 'Your Key Differentiator', placeholder: 'AI-powered search + 500+ transactions experience' },
    ],
    fullPrompt: `Create a buyer consultation presentation outline for [BUYER_NAME].

Market: [CITY] | Budget: [BUDGET]
Agent: [AGENT_NAME]
Differentiator: [DIFFERENTIATOR]

Presentation Flow (30 minutes):

SLIDE 1-2: RAPPORT BUILDING
- Opening question to understand their "why"
- Show you've done research on their needs

SLIDE 3-4: MARKET OVERVIEW
- [CITY] market snapshot (buyer-relevant stats)
- What their budget gets them (visual comparison)

SLIDE 5-6: THE BUYING PROCESS
- Step-by-step timeline with realistic dates
- Common surprises and how you prevent them

SLIDE 7-8: YOUR VALUE PROPOSITION
- What you do differently: [DIFFERENTIATOR]
- Recent success stories with similar buyers
- Your negotiation track record (specific stats)

SLIDE 9: THE MONEY STUFF
- How agent compensation works (post-NAR settlement)
- Buyer broker agreement explanation
- Why it's worth it (frame the value)

SLIDE 10: NEXT STEPS
- Pre-approval (offer lender intro)
- Search criteria refinement
- First showing schedule

For each slide:
- Title, key talking points, visual suggestion
- One "aha moment" data point
- Transition to next slide

Requirements:
- Address NAR settlement changes directly
- Include objection handling for "why do I need an agent?"
- Tone: consultative, not salesy`,
  },
  {
    id: 'pres-2',
    title: 'Seller Pre-Listing Presentation',
    category: 'Buyer/Seller Presentations',
    preview: 'Win more listings with a data-driven seller presentation.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'SELLER_NAME', label: 'Seller Name', placeholder: 'The Johnsons' },
      { key: 'ADDRESS', label: 'Property', placeholder: '123 Oak St, Vienna, VA' },
      { key: 'ESTIMATED_VALUE', label: 'Estimated Value', placeholder: '$750,000' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
      { key: 'MARKETING_BUDGET', label: 'Your Marketing Budget per Listing', placeholder: '$2,500' },
    ],
    fullPrompt: `Create a seller pre-listing presentation for [SELLER_NAME].

Property: [ADDRESS] | Est. Value: [ESTIMATED_VALUE]
Agent: [AGENT_NAME]
Marketing Budget: [MARKETING_BUDGET]

Presentation (15 slides):

1. COVER: Property photo + "Selling [ADDRESS]" + agent branding
2. ABOUT YOU: 60-second story (not resume)
3. MARKET OVERVIEW: What's happening in their neighborhood
4. PRICING STRATEGY: CMA summary + pricing recommendation
5. THE COMPETITION: What they're up against (active listings)
6. YOUR MARKETING PLAN: Step by step (this is your money slide)
7. DIGITAL MARKETING: Social media, ads, email reach
8. PHOTOGRAPHY & VIDEO: Professional media plan
9. AI-POWERED MARKETING: What you do that others can't
10. SHOWING STRATEGY: How to manage showings with minimal disruption
11. OFFER MANAGEMENT: Multiple offer strategy
12. TIMELINE: Week-by-week from signing to closing
13. TRACK RECORD: Stats, testimonials, recent sales
14. COMMISSION: Transparent fee breakdown + value justification
15. NEXT STEPS: Sign tonight, here's what happens Monday

For each slide: title, 3-4 bullet points, visual suggestion, talking point

Requirements:
- The marketing plan slide should be the WOW moment
- Address FSBO and discount broker objections
- Include a "what if it doesn't sell?" contingency
- Tone: confident partner, not begging for business`,
  },
  {
    id: 'pres-3',
    title: 'Relocation Buyer Presentation',
    category: 'Buyer/Seller Presentations',
    preview: 'Tailored presentation for out-of-state relocating buyers.',
    aiTools: ['ChatGPT', 'Claude', 'Perplexity'],
    isFree: false,
    variables: [
      { key: 'BUYER_NAME', label: 'Buyer Name', placeholder: 'David Chen' },
      { key: 'RELOCATING_FROM', label: 'Relocating From', placeholder: 'San Francisco, CA' },
      { key: 'RELOCATING_TO', label: 'Relocating To', placeholder: 'Northern Virginia' },
      { key: 'BUDGET', label: 'Budget', placeholder: '$800,000' },
      { key: 'EMPLOYER', label: 'Employer (if known)', placeholder: 'Amazon (HQ2)' },
    ],
    fullPrompt: `Create a relocation buyer presentation for [BUYER_NAME] moving from [RELOCATING_FROM] to [RELOCATING_TO].

Budget: [BUDGET] | Employer: [EMPLOYER]

Include:
1. WELCOME: "Your [RELOCATING_TO] Relocation Guide"
2. COST OF LIVING COMPARISON: [RELOCATING_FROM] vs [RELOCATING_TO]
3. NEIGHBORHOOD MATCHING:
   - "You loved [X] about [RELOCATING_FROM]? You'll love [Y] here"
   - 3-5 neighborhood recommendations based on their lifestyle
4. COMMUTE ANALYSIS: Distance/time to [EMPLOYER]
5. SCHOOL COMPARISON: If relevant
6. WHAT [BUDGET] GETS YOU HERE: Visual comparison
7. THE REMOTE BUYING PROCESS: How to buy from afar
8. RELOCATION TIMELINE: 90-day action plan
9. LOCAL RESOURCES: Movers, utilities, DMV, etc.
10. YOUR RELOCATION EXPERTISE: Past relo clients, reviews

Requirements:
- Make them feel excited, not overwhelmed
- Include "things nobody tells you about [RELOCATING_TO]"
- Anticipate culture shock moments
- Tone: welcoming ambassador`,
  },
  {
    id: 'pres-4',
    title: 'Investment Property Analysis Presentation',
    category: 'Buyer/Seller Presentations',
    preview: 'ROI-focused presentation for real estate investor clients.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'INVESTOR_NAME', label: 'Investor Name', placeholder: 'James' },
      { key: 'PROPERTY_ADDRESS', label: 'Property', placeholder: '789 Rental Ave, Arlington, VA' },
      { key: 'PURCHASE_PRICE', label: 'Purchase Price', placeholder: '$550,000' },
      { key: 'ESTIMATED_RENT', label: 'Estimated Monthly Rent', placeholder: '$3,200' },
      { key: 'DOWN_PAYMENT', label: 'Down Payment', placeholder: '25%' },
    ],
    fullPrompt: `Create an investment property analysis presentation for [INVESTOR_NAME].

Property: [PROPERTY_ADDRESS]
Purchase Price: [PURCHASE_PRICE] | Down Payment: [DOWN_PAYMENT]
Estimated Rent: [ESTIMATED_RENT]/month

Include:
1. PROPERTY OVERVIEW: Key details + photos
2. FINANCIAL ANALYSIS:
   - Monthly cash flow breakdown (PITI, HOA, vacancy, maintenance, management)
   - Annual ROI (cash-on-cash return)
   - Cap rate calculation
   - 5-year appreciation projection
3. MARKET ANALYSIS: Rental demand in the area
4. COMPARABLE RENTALS: What similar units rent for
5. VALUE-ADD OPPORTUNITIES: Potential improvements + ROI
6. RISK FACTORS: Honest assessment
7. TAX BENEFITS: Depreciation, deductions overview
8. EXIT STRATEGIES: Hold, flip, 1031 exchange
9. RECOMMENDATION: Buy/pass with reasoning

Requirements:
- Show the actual math (investors want numbers)
- Include best-case and worst-case scenarios
- Compare to other investment vehicles (stock market, etc.)
- Tone: analytical, data-first, honest about risks`,
  },
  {
    id: 'pres-5',
    title: 'Luxury Home Marketing Proposal',
    category: 'Buyer/Seller Presentations',
    preview: 'White-glove marketing proposal for luxury listing appointments.',
    aiTools: ['ChatGPT', 'Claude'],
    isFree: false,
    variables: [
      { key: 'SELLER_NAME', label: 'Seller Name', placeholder: 'Dr. & Mrs. Hamilton' },
      { key: 'ADDRESS', label: 'Property', placeholder: '1 Estate Dr, Great Falls, VA' },
      { key: 'PRICE', label: 'Expected Price', placeholder: '$3,200,000' },
      { key: 'AGENT_NAME', label: 'Your Name', placeholder: 'Dustin Fox' },
    ],
    fullPrompt: `Create a luxury home marketing proposal for [SELLER_NAME].

Property: [ADDRESS] | Price: [PRICE]
Agent: [AGENT_NAME]

This is NOT a standard listing presentation. Create a white-glove proposal:

1. COVER: Elegant, magazine-style
2. PROPERTY STORY: The narrative of this home (history, design intent)
3. MARKET POSITIONING: Where this sits in the luxury market
4. BUYER PERSONA: Who is buying $3M+ homes right now?
5. MARKETING STRATEGY:
   - Professional photography (twilight, aerial, lifestyle)
   - Cinematic video tour (60-90 second)
   - Virtual staging / 3D tour
   - Custom property website with its own domain
   - Luxury print materials (brochure, mailer)
   - Targeted digital ads (geo-fenced, income-targeted)
   - Luxury publications (WSJ, Mansion Global, etc.)
   - Private broker events
   - International marketing plan
6. TIMELINE: Pre-market → Launch → First 30 days
7. PRIVACY & DISCRETION: How you protect their privacy
8. YOUR LUXURY CREDENTIALS: $X in luxury sales, certifications
9. TERMS: Fee structure for luxury-level service

Requirements:
- Every word should feel premium
- No clip art, no templates — this should feel bespoke
- Include specific vendor names and deliverables
- Tone: Sotheby's-level sophistication`,
  },
];
