---
name: build-open-house-feedback-site
description: Build a branded, mobile-first open-house guest feedback website with a QR-ready public experience and a separate private owner dashboard. Use when a real estate agent wants to replace paper or digital sign-in sheets, collect room-by-room ratings and comments, create seller-facing feedback insights, or reproduce the luxury open-house feedback workflow from a listing URL, property address, photos, and logo.
---

# Build Open House Feedback Site

Create a working guest feedback experience and private owner dashboard from the agent's listing materials. Make the smallest necessary assumptions, preserve factual accuracy, and verify the finished links before handoff.

## Intake gate

Before building, collect these four required inputs in one concise request:

1. Public listing URL
2. Full property address
3. Property photos, supplied as uploads or an accessible folder URL
4. Brokerage or team logo, supplied as an upload or accessible file URL

Ask only for missing required inputs. Do not begin the build while any required input is missing or inaccessible.

Also offer these optional choices without blocking progress:

- Brand colors or a website from which they may be inferred
- Contact fields to collect; default to name and email
- Marketing consent language
- Incentive or giveaway details
- Additional questions for buyers, agents, neighbors, or guests
- Preferred publishing platform

Never invent property facts, room labels, legal disclosures, incentive rules, contact details, or branding.

## Build workflow

1. Inspect the listing URL, photos, address, and logo. Cross-check room identities against the listing and visual evidence.
2. Create a room inventory. Use only rooms supported by the sources. Flag ambiguous photos instead of confidently mislabeling them.
3. Derive a restrained visual system from the supplied logo and listing. Favor a polished, mobile-first luxury presentation without compromising readability.
4. Build the public guest experience described in [references/experience-spec.md](references/experience-spec.md).
5. Build the separate private owner dashboard described in that reference.
6. Store submissions persistently using the safest supported data layer. Keep guest and owner routes distinct.
7. Make the guest route accessible to anyone with the link when the user authorizes publishing. Do not make the owner dashboard discoverable from the guest experience.
8. Create a QR-ready guest URL. Generate a QR image only after confirming the final guest URL.
9. Test the complete flow with one clearly labeled test submission, confirm that it appears accurately in the owner dashboard, and remove the test record when practical.
10. Verify mobile and desktop layouts, empty states, required-field validation, image loading, data persistence, and link permissions.

## Privacy and trust rules

- Collect only fields needed for the stated experience.
- Keep marketing consent optional, unchecked by default, and separate from operational contact fields.
- Add a plain-language privacy notice identifying who receives the responses and why.
- Do not promise anonymity when names, emails, device data, or other identifiers are collected.
- Do not create sweepstakes or giveaway language without user-supplied eligibility, dates, prize, sponsor, and official terms. Omit the incentive if these details are unavailable.
- Never expose private owner data, raw database controls, secret keys, or administrative routes in the guest interface.
- Require explicit user authorization immediately before public publishing, changing access, or replacing an existing live site.

## Quality bar

Treat these as blocking defects:

- A property photo is assigned to the wrong room without a visible uncertainty note.
- The guest experience cannot submit or the dashboard cannot retrieve the submission.
- The owner dashboard is publicly linked from the guest route.
- Marketing consent is bundled with required registration.
- The QR code points to a preview, expired, or restricted URL.
- The supplied logo is stretched, recolored incorrectly, or visually illegible.

## Handoff

Return:

- Public guest-experience link
- Private owner-dashboard link and its access model
- QR-code file or confirmed QR-ready URL
- Concise list of included rooms and questions
- Storage location for submissions
- Test result and any unresolved photo-label uncertainty
- Clear instructions for changing listing content or reusing the workflow for another property

Do not call the work complete until both links open with the intended permissions and a full test submission reaches the dashboard.
