export const STORY68_CONTENT = String.raw`{{image:/blog/chatgpt-automated-listing-presentation/cover.png|ChatGPT automated listing presentation workflow shown on an AgentAIBrief cover.}}

## Quick Summary

- Codex Record & Replay can turn one demonstrated desktop workflow into a reusable skill when the feature is available for your plan and region
- The workflow in this case starts with one property address, gathers authorized source facts, applies documented comp rules, and prepares both a listing deck and a CMA report
- The system does not replace pricing judgment, MLS expertise, compliance review, or the agent's final approval
- OpenAI's current documentation says Record & Replay runs in the Codex app on macOS and uses Computer Use, so recordings should never expose passwords, private client data, or unnecessary secrets
- The 757 captured items shown in this case came from one documented workflow. It is not an OpenAI product limit or performance promise

{{motion:story68-listing-prep}}

ChatGPT automated my listing presentation by helping turn a demonstrated preparation process into a reusable Codex skill. I showed the workflow once, beginning with a property address and ending with a presentation deck plus a comparative market analysis. The important result was not a magic one-click valuation. It was a [repeatable Record & Replay operating procedure](/blog/automating-real-estate-with-ai-codex-record-replay) that gathered approved information, followed written selection rules, assembled consistent deliverables, and stopped for human review before anything reached a seller.

That distinction matters. Most agents hear “AI listing presentation” and imagine a prettier prompt. A prompt can draft copy, summarize notes, or suggest slide headings. A reusable skill is different. It captures the order of operations, the decisions that must be made, the sources that may be used, the output format, and the checks that protect the final presentation. In other words, it does not merely generate words. It helps operate a documented process.

The feature behind this case is **Record & Replay in the Codex app for macOS**. OpenAI describes it as a way to demonstrate a workflow once and turn that demonstration into a reusable skill. OpenAI also notes that the feature uses Computer Use and that availability depends on eligibility and region. The safest source for current access details is OpenAI's [Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540-codex-in-chatgpt) page. Product availability changes, so check that page before designing a business process around the feature.

## What Actually Got Automated

The automated portion was listing-preparation assembly, not the listing decision itself. The workflow accepts a property address, opens the sources the agent is authorized to use, collects the facts needed for analysis, applies a documented comp-search sequence, and organizes the results into seller-facing materials.

The sequence produces two primary deliverables:

1. A presentation deck that explains the property, the marketing approach, the market context, the pricing conversation, and the next steps.
2. A CMA report that supports the pricing discussion with selected comparable sales and the agent's analysis.

Those outputs share source facts, but they serve different purposes. The CMA is the analytical evidence. The listing deck is the guided conversation. Combining them into one repeatable process reduces the chance that the numbers, property details, or market story drift between documents.

The system also creates a review queue. It highlights items that need judgment, such as an unusual renovation, a comp that sits outside the normal radius, a property-type mismatch, a square-footage discrepancy, or a market shift that makes older sales less useful. Those decisions stay with the agent.

{{image:/blog/chatgpt-automated-listing-presentation/01-one-address.png|One property address flows through facts, comps, market context, deliverables, and human review.}}

## One Address Starts the Workflow

The best automation inputs are simple and explicit. In this case, the starting input is one property address. From there, the workflow creates a checklist of information to gather rather than assuming it already knows the property.

The initial fact set may include property type, legal or public-record details, finished square footage as reported by the relevant sources, bedroom and bathroom counts, lot characteristics, year built, tax information, association information when applicable, prior sale history, and documented improvements supplied by the agent or seller. No single source should be treated as perfect. If two sources disagree, the workflow should preserve the conflict for review rather than silently selecting the more convenient number.

This is especially important with finished area, additions, permits, and bedroom counts. A polished presentation can still be wrong. The automation should never smooth over uncertainty just because a clean slide looks better.

After the subject-property facts are assembled, the workflow moves to market evidence. It does not begin by grabbing the nearest three homes. It begins with the agent's written comp rules.

## Rules Before Comparable Sales

A CMA is only as credible as its selection logic. Automation makes weak comp logic faster, which is not an improvement. The skill therefore needs a clear search sequence that reflects how the agent evaluates the property.

The first filter is property type. Detached homes should not be casually compared with townhouses. Condominiums need attention to building, fee structure, parking, amenities, and unit characteristics. A property with acreage, waterfront, a major renovation, or an unusual layout may require a wider search and more explicit adjustments.

The second filter is location. The appropriate boundary might be a subdivision, a school assignment area, a building, a market area, or a carefully chosen radius. The point is to document the logic before seeing which sales produce the desired answer.

The third filter is recency. In a fast-moving market, an older sale may tell a different story than a recent contract. The fourth filter is physical similarity, including size, condition, lot, garage, renovation level, and functional layout. The fifth filter is market behavior, including days on market, seller concessions, price changes, and whether the sale represents the same competitive set.

The final filter is agent judgment. A system can surface candidates and organize evidence, but it cannot inspect every nuance of condition, motivation, or transaction context. The agent must decide which sales truly inform the seller's pricing conversation.

{{image:/blog/chatgpt-automated-listing-presentation/02-rules-before-comps.png|Documented comp rules filter candidate sales before final agent judgment.}}

## The Comp Selection Ladder

A useful comp workflow expands in deliberate steps. Start narrow and widen only when the evidence is insufficient. A practical ladder looks like this:

1. Same property type in the closest defensible micro-market.
2. Most recent closed sales with similar size and condition.
3. Relevant pending and active competition for current positioning.
4. A wider time window if recent closed evidence is thin.
5. A wider geographic boundary if the property is unusual or inventory is limited.
6. Clearly labeled supplemental sales when no close match exists.

Each expansion should be recorded. That creates an audit trail explaining why a sale appeared in the final report. If a seller asks why a comp from farther away matters, the agent has an answer grounded in the process.

The automation can also create a rejection list. A rejected sale is not useless. Recording why it was excluded, such as different construction type, inferior condition, unrelated school assignment, non-arm's-length circumstances, or a materially different lot, prevents the same weak candidate from returning later without context.

This documented selection ladder is one of the strongest parts of the workflow. It turns comp gathering from a visual search into a repeatable analytical method.

## The Presentation Deck and CMA Stay Aligned

Many listing packages fail because the deck and the CMA tell slightly different stories. The CMA may show one price range while the deck contains an older chart. The deck may describe improvements that never appear in the pricing analysis. A seller may notice that mismatch even if the agent does not.

The reusable workflow uses one verified fact set for both deliverables. The presentation can translate the analysis into clear language, while the CMA preserves the detailed evidence. The same subject-property facts, comp labels, market dates, and caveats should flow into both outputs.

The deck can include:

- A clean property introduction
- The agent's preparation and communication process
- Verified property strengths and documented improvements
- The marketing plan and distribution sequence
- Market context relevant to the subject property
- Pricing strategy and selected comparable evidence
- A launch checklist and next steps

The CMA can include the selected sales, adjustments or analytical notes, market statistics from authorized sources, competing inventory, and the agent's recommended positioning discussion. The workflow may prepare these pieces, but it should not present an automated number as the final list price.

{{image:/blog/chatgpt-automated-listing-presentation/03-two-deliverables.png|One verified research set supports a listing deck and a CMA report.}}

## Why a Reusable Skill Beats a Giant Prompt

A giant prompt usually mixes instructions, facts, desired output, and exceptions in one block. It works until the next property is different. Then the agent adds another paragraph, another warning, and another example. Eventually the prompt becomes hard to audit and easy to break.

A reusable skill separates stable process from property-specific inputs. The stable process includes the source hierarchy, comp rules, file naming, slide order, review checks, and approval requirements. The property-specific input includes the address, seller-provided improvements, appointment date, authorized MLS information, and any special context. This same separation is the foundation of the [nine AI operating cycles we use in real estate](/blog/nine-ai-operating-cycles-real-estate-business).

This separation makes maintenance easier. If the team changes its deck template, update the output step. If a source changes, update the source instruction. If compliance requirements change, update the review checklist. The entire workflow does not need to be rewritten for every listing.

It also makes delegation safer. A team member can run the same process without guessing which files belong in the final package. The skill can specify where drafts go, what must remain private, which fields require confirmation, and what evidence must be attached to the review.

## What Record & Replay Captured

The documented run behind this article produced a captured workflow inventory containing **757 items**. That number belongs to this one recorded process. It is not an official OpenAI limit, a standard number of actions, or a claim that every recording should be that large.

The count is useful because it shows how much invisible work exists inside a task agents casually call “make the listing presentation.” The real process may include opening authorized tools, navigating to the correct records, checking values across sources, selecting reports, moving information into templates, naming files, exporting documents, and performing visual checks.

Record & Replay can observe that demonstrated sequence and help convert it into a reusable skill. The best result still requires cleanup. Repeated clicks, accidental detours, stale interface details, and sensitive information should be removed from the skill. A recording is raw evidence of a workflow, not a finished operating procedure.

OpenAI's documentation also warns users to avoid exposing secrets during Computer Use. That is critical in real estate. A recording should not reveal passwords, private seller communications, client financial information, access codes, personal identification, or unnecessary CRM data. Use a clean browser state, limit permissions, and stop the recording before sensitive information appears.

{{image:/blog/chatgpt-automated-listing-presentation/04-757-items.png|One documented workflow contained 757 captured items across demonstration, review, and replay.}}

## Current OpenAI Product Facts

OpenAI announced GPT-5.6 availability across ChatGPT, Codex, and the API in July 2026. OpenAI's [GPT-5.6 launch page](https://openai.com/index/gpt-5-6/) is the primary source for that release. The related ChatGPT help article explains that GPT-5.6 Sol supports Medium, High, and Extra High reasoning settings as the rollout progresses.

Those model details are separate from Record & Replay eligibility. The relevant Record & Replay documentation says the feature is available in the Codex app on macOS for eligible users and relies on Computer Use. Plan, region, app version, and rollout status can affect access. There is no reason to invent a universal recording-time limit when OpenAI's current help material does not publish one for this workflow.

That is why this article avoids the common claim that every listing-presentation recording must fit inside a fixed number of minutes. The practical goal is to demonstrate a clean, bounded workflow. If the process is too long or contains unrelated branches, split it into smaller skills that are easier to maintain and review.

## The Human Review Gate

The agent remains responsible for the presentation. The workflow should stop before the package is treated as final and present a review checklist with evidence.

At minimum, verify:

- The subject address and property type
- Square footage, bedroom and bathroom counts, lot details, and association information
- Improvement descriptions and any permit caveats
- Comp addresses, status, close date, price, concessions, and material differences
- The date range and geography used for market statistics
- Chart labels, legends, and totals
- Seller names and private details
- Links, QR codes, exports, and file names
- Fair housing and advertising compliance
- Any claim about expected price, timing, or buyer response

The review should also include visual inspection. A chart can contain the right data and still be unreadable. A slide can be accurate and still crop the seller's name. A PDF can export with missing fonts, broken images, or an outdated footer. The final deliverables need to be opened exactly as the seller will see them.

{{image:/blog/chatgpt-automated-listing-presentation/05-human-qa.png|A listing presentation passes through a final agent review gate.}}

## Protecting Seller Information

Real estate workflows contain sensitive information, even when the final deck looks public. Seller contact details, appointment notes, access instructions, mortgage context, divorce or estate circumstances, relocation details, and private communications should not become training examples or appear in a recorded workflow.

Use the minimum information necessary. Create templates with placeholders. Demonstrate the process with a safe test property or sanitized record when possible. Restrict the skill to the folders and tools it genuinely needs. Keep write access narrower than read access. Require approval before any external upload, sharing action, or message.

The recorded workflow should also distinguish public records from private client inputs. A property description from a public listing is not the same as a seller's confidential reason for moving. The skill should know which category it is handling and exclude private context from seller-facing or marketing output unless the seller has explicitly approved it.

## Fair Housing and Local Compliance

AI-generated listing materials must describe the property and verified area features, not the type of person who should live there. Avoid language aimed at families, singles, retirees, religions, races, national origins, ages, genders, disabilities, or other protected groups. Describe the home's layout, systems, access features, nearby public amenities, transportation options, and documented school assignments factually.

School information needs careful handling. Assignments change, ratings can be misleading, and buyers should verify current boundaries with the school system. If the presentation includes school names, cite the source and date. Do not use schools as coded language for the people who live in an area.

The same principle applies to neighborhood descriptions. Focus on objective property and location facts. If the automation drafts lifestyle copy, the review gate should scan for protected-class targeting, unsupported superlatives, and claims that cannot be verified.

## How to Record a Cleaner Workflow

Preparation determines whether Record & Replay captures a useful process or a pile of noise. Before recording, close unrelated tabs, sign in to approved tools, prepare a safe sample input, and decide where every output will be saved. Write the ideal sequence as a checklist.

During the demonstration, move deliberately. Pause before major choices. Use consistent names. If a decision depends on judgment, state the rule rather than pretending the choice is automatic. When a source is unavailable or contradictory, show the workflow's fallback behavior.

After recording, review the captured steps. Remove accidental clicks and repeated navigation. Replace fragile screen coordinates with durable instructions when possible. Separate optional branches. Add explicit stop conditions for missing data, authentication problems, unclear comp evidence, and failed exports. Our [Record & Replay YouTube ads workflow](/blog/codex-record-replay-real-estate-youtube-ads) shows the same clean-demonstration principle in a different operational setting.

Then test the skill on a second property that differs from the example. A useful test property might have an association, an unusual lot, a recent renovation, or limited comp inventory. The goal is to discover where the process depends too heavily on the original demonstration.

## A Practical Build Sequence

If you want to create a similar listing-preparation skill, build it in stages. The earlier [listing presentation AI workflow](/blog/listing-presentation-ai-hack) provides another practical view of the presentation-prep problem.

1. Document the current manual process without trying to improve it.
2. Identify approved sources, required inputs, and prohibited data.
3. Define the subject-property fact checklist.
4. Write the comp selection ladder and rejection reasons.
5. Standardize the deck and CMA templates.
6. Record a clean demonstration in a safe environment.
7. Review and simplify the captured workflow.
8. Add stop conditions and approval gates.
9. Test on a materially different property.
10. Compare every output with the manual standard.

Do not automate external sharing in the first version. Keep the skill focused on research assembly and draft production. Once the internal output is dependable, you can consider carefully scoped downstream actions with explicit approval.

## Where This Workflow Saves Effort

The clearest savings come from consistency and reduced rework. The workflow remembers the source order, the file names, the required deck sections, the CMA checklist, and the review steps. The agent does not need to reconstruct that sequence before every appointment.

It also improves handoffs. A team member can see what has been gathered, what remains uncertain, and what the agent must approve. Missing inputs become visible earlier. That is more valuable than claiming an unverified number of hours saved.

This case did not establish a controlled time study, conversion lift, or guaranteed appointment outcome. Any such claim would require repeated measurement across comparable listings. Start by tracking practical metrics: draft completion time, number of factual corrections, missing-file incidents, review time, and whether the deck and CMA agree. Those measures show whether the system is genuinely improving the operation.

## What Should Never Be Automated Away

Seller strategy is not a browser sequence. Pricing judgment, expectation setting, interpretation of unusual property features, discussion of market risk, and the decision to accept or reject an engagement require experienced human judgment.

The system should not promise a sale price, fabricate buyer demand, conceal weak evidence, or select comps because they support a preferred conclusion. It should not send the presentation, edit an MLS record, publish marketing, or contact anyone without the user's specific approval and the required permissions.

The best automation removes repetitive assembly so the agent can spend more time interpreting evidence and communicating clearly. It should make expertise more visible, not make expertise optional.

## The Bottom Line

ChatGPT did not replace the listing appointment. Codex helped turn the preparation behind it into a repeatable skill.

One address starts the run. Authorized sources provide the facts. Written rules narrow the comp candidates. A shared fact set supports the listing deck and the CMA. The agent reviews every important number, claim, chart, link, and seller detail before the package is final.

That is the real opportunity with Record & Replay. Do not ask AI to improvise your professional judgment. Demonstrate a strong process, remove sensitive data, encode the rules, test the edge cases, and keep the final decision in human hands. [Subscribe to AgentAIBrief](/subscribe) for more verified AI workflows built for real estate operators.

## Frequently Asked Questions

### Is Record & Replay available to every ChatGPT user?

No universal access should be assumed. OpenAI says the feature is available in the Codex app on macOS for eligible users, with plan and regional considerations. Check the current official Codex help page for your account.

### Does the workflow choose the final list price?

No. It can gather authorized evidence, organize comp candidates, and prepare a pricing discussion. The agent reviews the evidence and makes the professional recommendation.

### Is 757 an OpenAI limit?

No. It is the captured-item count from the documented workflow used for this case. It is not a product limit or a promised result.

### Can the recording include MLS credentials or seller information?

It should not. OpenAI advises users to avoid exposing secrets during Computer Use. Demonstrate with sanitized inputs, narrow permissions, and safe browser state.

### Why create both a deck and a CMA?

The CMA preserves detailed market evidence. The deck turns that evidence into a structured seller conversation. Building both from one verified fact set keeps the story consistent.

### What is the first metric to track?

Track correction count. If the workflow reduces factual mismatches and missing elements across several listings, it is improving quality. Then measure preparation and review time without making claims before the data exists.
`;

export const STORY68_FAQ = [
  {
    question: 'Is Record & Replay available to every ChatGPT user?',
    answer: 'No universal access should be assumed. OpenAI says the feature is available in the Codex app on macOS for eligible users, with plan and regional considerations. Check the current official Codex help page for your account.',
  },
  {
    question: 'Does the workflow choose the final list price?',
    answer: 'No. It can gather authorized evidence, organize comp candidates, and prepare a pricing discussion. The agent reviews the evidence and makes the professional recommendation.',
  },
  {
    question: 'Is 757 an OpenAI limit?',
    answer: 'No. It is the captured-item count from the documented workflow used for this case. It is not a product limit or a promised result.',
  },
  {
    question: 'Can the recording include MLS credentials or seller information?',
    answer: 'It should not. OpenAI advises users to avoid exposing secrets during Computer Use. Demonstrate with sanitized inputs, narrow permissions, and safe browser state.',
  },
  {
    question: 'Why create both a deck and a CMA?',
    answer: 'The CMA preserves detailed market evidence. The deck turns that evidence into a structured seller conversation. Building both from one verified fact set keeps the story consistent.',
  },
  {
    question: 'What is the first metric to track?',
    answer: 'Track correction count. If the workflow reduces factual mismatches and missing elements across several listings, it is improving quality. Then measure preparation and review time without making claims before the data exists.',
  },
];
