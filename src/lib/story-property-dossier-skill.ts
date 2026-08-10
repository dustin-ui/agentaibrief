export const PROPERTY_DOSSIER_SKILL_CONTENT = `{{image:/blog/chatgpt-property-dossier-skill-2026/cover.png|One prompt can launch a complete property due-diligence dossier workflow.}}

## Quick Summary

- A property due-diligence scan usually crosses assessment, parcel mapping, deed, permit, zoning, health, hazard, utility, access, association, and nearby-project sources.
- The free ZIP below gives ChatGPT Work a reusable operating procedure for finding the right agencies, collecting underlying documents, labeling gaps, and packaging the result.
- OpenAI says Work is built for longer, multi-step assignments and finished deliverables. It is available on eligible paid plans across web, mobile, and the desktop app, subject to plan and workspace controls.
- A good output is an evidence-linked screening package, not a title opinion, survey, environmental assessment, legal opinion, or guarantee of completeness.
- The operator should review every source, document, limitation, and delivery address before relying on or sharing the package.

One address can trigger a surprisingly complicated research job. Assessment data may live with a tax agency. Parcel boundaries may come from a GIS division. Deeds and plats may sit with a court clerk. Building permits, zoning cases, private-well files, septic approvals, utility information, flood layers, and planned road work may each live in a different portal. The free skill in this article turns that scattered search into one structured ChatGPT Work assignment.

{{motion:property-dossier-scope}}

## Download the Property Dossier Skill

This is the exact supplied ZIP, preserved byte for byte under a neutral public filename. It includes the full skill instructions, a Fairfax County reference guide, a broad research matrix, nearby-project guidance, packaging code, a report template, an evidence index, an attachment checklist, and an email template.

{{download:property-dossier-skill}}

Read the archive before using it. The workflow can search public sources, download available files, build a dossier, and prepare delivery, but the human operator remains responsible for permissions, factual review, privacy, and any consequential follow-up.

## Why Property Research Becomes Fragmented

The most common mistake is assuming the mailing city tells you which agency controls every file. It does not. A county may assess the land, a city may issue a renovation permit, a health district may hold the well file, a circuit court may maintain the deed, and a state agency may control a road project nearby. A useful search starts by identifying the property and then mapping authority by document type.

That distinction matters around municipal boundaries and special districts. Two homes with the same postal locality may have different permit authorities. A house can have a county tax account while a town administers zoning. A parcel may use public water but private sewage. The address is the starting point, not the jurisdiction map.

The supplied skill therefore begins with normalization and confirmation. It asks for the complete address and the delivery email. It resolves the country, state, county-equivalent, incorporated municipality or township, postal locality, and any relevant special district. Near a boundary, it requires a second official source before the workflow proceeds.

This is a stronger pattern than throwing an address into a general search engine. Search results are useful for discovery, but official agency pages, agency-linked vendor portals, meeting packets, downloadable files, and direct government databases should carry the evidence. Listing sites, crowdsourced maps, snippets, and aggregators can point toward a source, but they should not become the final source.

For a broader example of turning repeated research into an operating procedure, see [the AgentAIBrief guide to building reusable AI skills](/blog/ai-skill-file-business-automations). The principle is the same here: define inputs, authority, evidence standards, output structure, and human approval before asking an agent to act.

{{image:/blog/chatgpt-property-dossier-skill-2026/parcel-assessment.png|Watercolor editorial scene of a researcher comparing a parcel assessment, house image, and official documents.}}

## What ChatGPT Work Can Do Today

OpenAI describes Work as the ChatGPT experience for longer, multi-step assignments and finished deliverables. Its official guidance says Work can research a topic, analyze information, and create documents, spreadsheets, presentations, reports, or Sites. Work is available on eligible paid plans on the web and mobile, and in the desktop app when the plan and workspace include it.

That current product description corrects two easy assumptions. First, this workflow is not limited to the desktop app. Work can run in the cloud on web and mobile. Second, availability depends on the plan and workspace controls. An organization can restrict tools, local files, browser access, or other capabilities even when Work appears in the interface.

OpenAI also says Projects can hold uploaded PDFs, spreadsheets, documents, images, or pasted text as reusable context. Projects are useful here because the skill ZIP, property address, source notes, and later follow-up questions can stay together. File limits vary by plan, and large files still have size and token limits, so a bulky plan set may need selective handling.

The clean setup is:

1. Open ChatGPT and select Work.
2. Create or open a Project for the property.
3. Add the supplied skill archive or its extracted folder as approved context.
4. Give the complete address and the intended delivery email.
5. State any jurisdiction, timing, privacy, or scope limits.
6. Review the proposed plan before allowing broad research.
7. Inspect the final package and every important source before sharing it.

OpenAI's [Work and Codex guidance](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex) explains the current interface and availability. Its [Projects documentation](https://help.openai.com/en/articles/10169521-projects-in-chatgpt) explains persistent project context and file handling. The [file upload FAQ](https://help.openai.com/en/articles/8555545-uploading-files-in-chatgpt) covers supported file categories and limits.

There is no universal promise that every property will finish in a fixed number of minutes. A fast public-data search may complete in one session. A parcel with multiple permits, large plan sets, private portals, login barriers, missing health files, or several nearby construction cases can take much longer. If Dustin's test completed in roughly 35 minutes, treat that as one observed run, not a service-level guarantee.

## The Source Map Behind a Useful Dossier

A strong package begins with an authority map. The skill covers the following source families:

- Tax assessment and parcel identification.
- GIS boundaries, address validation, aerial imagery, and mapped overlays.
- Deeds, plats, easements, and court-held land documents.
- Building, trade, land-disturbance, and occupancy permits.
- Code cases, inspection histories, corrections, and final approvals.
- Zoning, land-use decisions, development conditions, and approved plans.
- Private well, septic, soil, and environmental-health files.
- Flood, wetland, contamination, historic, and environmental constraints.
- Public utilities, private systems, road access, and transportation projects.
- Association documents and obligations when legitimately available.
- Nearby approved, funded, permitted, pending, completed, or cancelled work.

The list is broad because a single portal rarely answers all of those questions. Fairfax County provides a useful illustration. Its official assessment site contains assessed values and physical characteristics. The county GIS division manages parcel mapping and address tools. PLUS spans zoning, building, permitting, and other land-development processes. The Health Department administers onsite sewage and private-well systems. The Circuit Court maintains land documents.

Those sources overlap, but they do not replace one another. A GIS outline is not a survey. A permit summary is not an approved plan set. A zoning staff report that cites an attachment is not the attachment. A parcel characteristic does not prove that a finished area received every required approval. A septic label on a site drawing is not automatically the health department's installation or as-built file.

{{image:/blog/chatgpt-property-dossier-skill-2026/gis-map.png|Watercolor editorial scene of a GIS analyst reviewing aerial parcel boundaries and mapped layers.}}

This is why the skill does more than log links. For every located case, permit, approval, deed reference, health file, or plat reference, it asks the operator to look for the underlying documents. When a source is unavailable, the package should identify the holder, the precise request path, the access barrier, and the next action. It should never quietly substitute a portal summary for the real file.

Official Fairfax sources used to validate this workflow include the [real estate assessment site](https://icare.fairfaxcounty.gov/ffxcare/Main/Home.aspx), the [GIS division](https://www.fairfaxcounty.gov/maps/), the [PLUS information page](https://www.fairfaxcounty.gov/planning-development/plus), the [onsite sewage and private-well page](https://www.fairfaxcounty.gov/health/sewage-and-water), and the [Historic Center overview](https://www.fairfaxcounty.gov/circuit/node/171). The skill includes a dedicated Fairfax reference because the responsible office changes by category.

## Evidence Is More Important Than a Long Summary

An impressive narrative is not enough. The package has to show what the AI found, where it found it, what file was retrieved, what could not be retrieved, and what the operator should verify next.

The supplied workflow uses four status labels:

- **Red, action likely required:** a documented conflict, open case, unresolved approval, or material restriction.
- **Yellow, verify:** missing, inconsistent, old, or ambiguous evidence.
- **Green, supporting file located:** evidence supports a stated fact, without declaring the property clear.
- **Gray, unavailable or outside public scope:** the package identifies the holder and the next action.

Those labels are intentionally conservative. Green does not mean there are no problems. Gray does not mean a file does not exist. A search that returns no match is not proof of absence. The operator must distinguish “no matching item located” from “no item exists.”

{{motion:property-dossier-evidence}}

The same discipline applies to nearby projects. A project should be classified by its actual status: under construction; funded or officially scheduled; permit issued; approved but not yet permitted; pending public review; conceptual; completed; or cancelled. The phrase “happening soon” belongs only where an official schedule, funding action, awarded contract, issued permit, or visible construction supports it.

Impact language also needs restraint. A road project may plausibly affect access, traffic, noise, dust, drainage, views, or utilities. Unless an official analysis reaches that conclusion, the dossier should label it as an inference. The workflow should not predict property-value changes.

This evidence-first approach resembles the process in [AgentAIBrief's ChatGPT listing-preparation workflow](/blog/chatgpt-automated-listing-presentation), where the agent gathers a structured source package and a human reviews the result before client use. The property dossier goes deeper on public-document categories, but it follows the same rule: a polished deliverable never outranks its source trail.

{{image:/blog/chatgpt-property-dossier-skill-2026/permit-review.png|Watercolor editorial scene of a building inspector reviewing plans at a residential renovation site.}}

## What the Downloaded ZIP Contains

The archive is not a one-page prompt. It is a small operating system for the assignment.

The main skill file defines inputs, jurisdiction discovery, source order, document-retrieval standards, core categories, nearby-project research, evidence reconciliation, package structure, quality control, delivery, and formal-request boundaries. It tells the agent to prefer official sources and to stop short of bypassing authentication, CAPTCHAs, paywalls, or access restrictions.

The Fairfax guide explains how county-specific responsibilities split among assessment, GIS, PLUS, health, and court sources. The research matrix expands the categories and the evidence expected in each one. The nearby-project guide defines status and impact language. Together, those reference files keep the broad search consistent.

The asset folder contains:

- A report template.
- A source-index template.
- An attachment-inventory template.
- An email template.

The included packaging script validates the expected folder structure, builds a manifest, checks that required files exist, and creates the final ZIP. That package can include an executive summary, the full report, a source index, an attachment checklist, an unavailable-items file, organized source files, and a machine-readable manifest.

The attachment checklist is especially important. It requires one row per expected underlying file, such as a plan set, plat, inspection history, final approval, septic design, well log, or decision letter. Each row says whether the file was retrieved, not publicly downloadable, not located, or not applicable. That makes missing evidence visible instead of burying it in a paragraph.

{{image:/blog/chatgpt-property-dossier-skill-2026/well-septic.png|Watercolor editorial scene of an environmental specialist and soil scientist examining a private well and drainfield area.}}

## The Human Review That Cannot Be Skipped

AI can reduce the search burden, but the result can still be wrong in consequential ways. An address can resolve to the wrong parcel. A permit can belong to a neighboring unit. An old plan can be superseded. A portal can omit attachments. A scanned document can be unreadable. A project status can change after the research date.

Before delivery, verify at least the following:

1. The address, parcel ID, and governing jurisdictions all refer to the same property.
2. County and municipal sources were both checked when authority overlaps.
3. Every core category is covered or explicitly marked unavailable.
4. Every important finding points to an official source or source file.
5. Every located permit or case is reconciled against its expected attachments.
6. Downloaded PDFs actually open, render, and contain the represented document.
7. Large plan sets were visually reviewed, not only indexed.
8. Nearby-project status and dates are current and not overstated.
9. Personal information unrelated to the assignment is excluded.
10. The delivery email is exactly the address the user supplied.

The skill's delivery section assumes a connected email capability governed by its own permission rules. That does not create blanket authority to email anyone. The operator should confirm the recipient and follow the platform's outbound-message policy. If email is unavailable or not authorized, provide the package inside the approved workspace and state clearly that it was not sent.

Formal requests are a separate decision. A freedom-of-information request, title copy request, health-file request, or court-copy order can expose a person's identity, require residency or contact details, create fees, or carry legal consequences. The skill tells the agent to identify the missing files and draft the request path, but to obtain explicit authorization before submitting anything on the user's behalf.

## What This Workflow Is Not

This is a public-document screening workflow. It is not a survey, title examination, environmental assessment, engineering opinion, legal opinion, permit certification, home inspection, or guarantee that every government file has been found.

Boundary issues belong with a licensed surveyor. Title and encumbrance questions belong with a title professional or attorney. Building-condition questions belong with an inspector or engineer. Regulatory interpretations belong with the responsible agency. The dossier helps the user find questions earlier and bring organized evidence to the right professional.

That boundary is a feature, not a weakness. The workflow can save time without pretending that faster retrieval replaces expertise. It can identify a missing final inspection without declaring a structure unlawful. It can locate a flood layer without interpreting insurance requirements. It can flag a discrepancy between assessment characteristics and permit files without deciding who is legally responsible.

{{motion:property-dossier-package}}

## A Practical First Run

Start with one property you already understand. Use a complete address, create a dedicated Project, upload the skill, and keep the scope to public-document research. Ask Work to show its jurisdiction map and research plan before it begins. That lets you catch a wrong municipality, missing health authority, or overly broad search early.

During the run, watch for proof quality. A list of portal links is not the deliverable. The agent should retrieve actual public files where permitted, log direct source URLs, preserve native PDFs, label missing attachments, and keep a clear research date. If a website blocks automation or requires a login, the agent should document the barrier instead of trying to bypass it.

When the package arrives, open the executive summary last. First inspect the source index, attachment checklist, and the highest-impact documents. Confirm that the red and yellow findings actually match the files. Then read the narrative summary with the evidence in mind.

For another example of using Work for a structured business assignment, read [the AgentAIBrief prospect-brief workflow](/blog/chatgpt-work-prospect-brief). The best Work tasks share a common pattern: clear scope, approved sources, explicit permissions, a defined deliverable, and a human verification gate.

{{image:/blog/chatgpt-property-dossier-skill-2026/deed-archive.png|Watercolor editorial scene of an archivist reviewing a historic deed book and rolled plats in a courthouse archive.}}

## The Bottom Line

Property research is difficult because the evidence is fragmented, not because one individual source is impossible to search. The skill below gives ChatGPT Work a disciplined way to resolve jurisdictions, map agencies, retrieve available underlying documents, track gaps, review nearby projects, reconcile discrepancies, and package the evidence.

Use it as an accelerator for due diligence, not a substitute for professional judgment. Keep the source trail visible. Label what is missing. Review every important file. Get explicit permission before any external request or delivery.

Download the exact skill near the top of this article, test it on one familiar property, and follow [AgentAIBrief on Instagram](https://instagram.com/agentaibrief) for more practical AI workflows. You can also [subscribe to AgentAIBrief](/subscribe) for new skills, operating procedures, and verification playbooks.
`;

export const PROPERTY_DOSSIER_SKILL_FAQ = [
  {
    question: 'What does the property dossier AI skill do?',
    answer:
      'It gives ChatGPT Work a structured process for identifying the correct jurisdictions, searching official property sources, retrieving available underlying documents, tracking missing evidence, reviewing nearby projects, and packaging an evidence-linked due-diligence report.',
  },
  {
    question: 'Does the skill replace a survey, title search, inspection, or legal review?',
    answer:
      'No. It is a public-document screening workflow. Boundary, title, condition, engineering, environmental, and legal questions should be reviewed by the appropriately licensed professional or responsible agency.',
  },
  {
    question: 'Do I need the ChatGPT desktop app to use the skill?',
    answer:
      'Not necessarily. OpenAI says Work is available on eligible paid plans across web and mobile, and in the desktop app when included for the plan and workspace. Local-file and tool access can vary by platform, plan, and workspace controls.',
  },
  {
    question: 'Will every property dossier finish in 35 minutes?',
    answer:
      'No fixed completion time is guaranteed. Timing depends on the number of jurisdictions, portal access, file volume, plan-set size, missing attachments, and whether human review or formal requests are needed.',
  },
  {
    question: 'Can the workflow submit formal government requests automatically?',
    answer:
      'The skill treats formal requests as a separate step. It can identify the missing documents and prepare the request path, but the user should provide explicit authorization and any required identity, residency, contact, or fee information before submission.',
  },
  {
    question: 'How should I verify the final package?',
    answer:
      'Confirm the property identity and jurisdictions, open the source index and attachment checklist, verify the highest-impact files, review missing evidence, check project dates and status, and confirm the final delivery address before sharing the result.',
  },
];
