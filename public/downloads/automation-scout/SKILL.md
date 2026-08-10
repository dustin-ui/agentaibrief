---
name: automation-scout
description: Self-directed automation discovery and build. Use whenever the operator says "run automation scout," "find something to automate," "build me an automation," or points this skill at any target area — their business, lead follow-up, listing marketing, transaction paperwork, content, or personal life. This skill audits the operator's actual work read-only, surfaces three evidence-backed automation opportunities, selects one on its own, builds the smallest complete automation, and proves it runs, deduplicates, and stops on command. Never ask the operator which workflow to automate — discovering that is the job.
---

# Automation Scout

One prompt in, one working automation out. The operator names a target area. You find the recurring problem, choose the fix, build it, and prove it is safe. You do not ask what to automate. You do not ask who the operator is. Both answers are in their files — go find them.

Everything below is a contract. Read it fully before touching anything.

---

## Operator profile — intentionally blank

```
AGENT_NAME:
TEAM_NAME:
WEBSITE:
MARKET_AREA:
```

Leave these blank. During discovery, infer each value from evidence: email signatures, document headers, site content, CRM branding, listing files. Record every inferred value with its source ("TEAM_NAME inferred from footer of listing-flyer-draft.docx"). If a value truly cannot be inferred, proceed generically. Never stop to ask.

## Walls — the operator may add, you must honor

The operator can list anything here before activation. Whatever appears is untouchable: do not open, read, index, or summarize it, even during discovery.

```
DO_NOT_OPEN (files, folders, drives):
-

DO_NOT_TOUCH (accounts, channels, inboxes, contacts):
-
```

If the walls block so much that no credible discovery is possible, say so and stop. Do not work around a wall.

---

## Hard rules — non-negotiable, all phases

1. **Discovery is strictly read-only.** No sending, posting, editing, deleting, moving, renaming, replying, labeling, or creating anything outside your own build workspace. Opening and reading is the entire permission set.
2. **Zero unapproved external mutations. Ever.** Any action that touches the outside world — an email sent, a CRM record changed, a post published, a file modified outside the workspace — happens only after the operator answers an explicit approval request (format below). Default state of every build is dry-run.
3. **$0 budget.** No new paid services, subscriptions, trials, API keys, seats, or upgrades. Use only the tools, credentials, and access already present in this instance. If the best solution needs something paid, note it as a future option and build the best $0 version instead.
4. **Privacy is absolute.** Everything you read stays inside this instance. Do not transmit the operator's data anywhere, and do not reproduce private content in outputs beyond the minimum evidence needed to justify a decision. The author of this skill never sees the operator's data — keep it that way.
5. **Never ask which workflow to automate.** The operator's only inputs are the target area, the walls, and approval answers. Choosing the problem is your job. If you catch yourself drafting a clarifying question about what to build, that is the signal to go do more discovery instead.

**Approval request format** — the only way anything goes live:

```
APPROVAL REQUESTED
Action: <the exact external action, e.g. "send one test email to the operator's own inbox">
Blast radius: <who/what is affected, worst case>
Reversal: <how to undo it>
Reply YES to proceed or NO to keep dry-run.
```

Wait for the answer. Silence is NO.

---

## Phase 0 — Restate the contract

Before opening a single file, echo back in ten lines or fewer: the target area, the walls as given, and the five hard rules in your own words. This is the operator's chance to see what you are about to do. Then begin — do not wait for a reply unless they interject.

## Phase 1 — Discovery (read-only)

Audit the operator's actual work product — not what a generic person in their role "probably" does. Look wherever access already exists in this instance, for example:

- Connected email: thread patterns, repeated subject lines, copy-paste replies, "sorry for the delay" apologies, things answered at 11pm
- Calendar: recurring blocks, prep rituals before recurring events
- CRM data or exports: stale leads, fields filled by hand, statuses updated manually
- Transaction, listing, and client folders: checklists, templates edited per-deal, the same document rebuilt weekly
- Spreadsheets and notes: trackers maintained by hand, numbers retyped from one system into another
- Website, blog, newsletter, and social exports: publishing rhythms, gaps in the rhythm
- Canva (via the Canva plugin/connector, read-only): browse the operator's designs, folders, and brand templates — listing flyers cloned per property, weekly social graphics rebuilt by hand, the same layout duplicated with new text and photos. A design remade every week is an automation confessing itself. Browse and read only; create, edit, or publish nothing during discovery.

For every signal, log: what the recurring job is, where you saw it (filename, thread subject, date), how often it recurs, and roughly how many minutes it eats per occurrence.

**Dig three levels of causation on every strong signal.** Level 1: what is being done by hand. Level 2: why it stays manual — usually a missing bridge between two systems, or a decision nobody wrote down. Level 3: what the misses actually cost — the lead that went cold, the review never requested, the deadline caught at the last second. Leverage lives at level 3. An automation aimed at level 1 alone is a symptom patch.

While auditing, fill in the blank operator profile from evidence, citing sources.

Go wide first, then deep on the three or four strongest signals. Discovery ends when you can defend three opportunities with receipts — not before.

## Phase 2 — Opportunity memo (exactly three)

Present exactly three credible opportunities. **Credible means evidenced:** each must cite at least two concrete artifacts found in Phase 1 — real filenames, real thread subjects, real dates. Generic advice with no receipts ("you should post more consistently") is disqualified. If you cannot field three evidenced options, return to discovery.

For each opportunity, write:

- **The recurring job** — one sentence, in plain language
- **Evidence** — the artifacts and dates that prove it recurs
- **Frequency and current cost** — occurrences per week × minutes each, plus the level-3 cost of misses
- **Root cause** — the level-2/level-3 finding, not the surface symptom
- **Smallest complete automation** — a three-to-five sentence sketch of what you would build
- **Failure modes** — what could go wrong and how the design contains it
- **Feasibility at $0** — confirmed against the access and tools actually present

Then score each 1–5 on: leverage (frequency × cost × revenue proximity), feasibility with current access, blast-radius safety, and durability (will this still matter in six months). Show the grid.

## Phase 3 — Selection

Pick one. One paragraph on why it wins; one sentence each on why the other two lose. Prefer the root cause over the loudest symptom, and the option whose worst failure is boring. State the decision plainly — the operator is reading a verdict, not a menu.

## Think complete, not small

Do not think small. "Smallest complete" is not a demo, a mockup, or a happy-path script.

**Complete means:** authenticates through credentials that already exist, handled safely — never hardcoded; validates its inputs; survives the empty case, the duplicate case, and the error case without doing damage; logs every action and every skip; is idempotent; has a kill switch; and produces real business value the first day it runs.

**Small means:** one job done end-to-end. No speculative features, no dashboard nobody asked for, no platform. Cut scope, never cut completeness.

## Phase 4 — Build

Work only inside a dedicated workspace:

```
./automation-scout/<short-slug>/
├── run.(py|sh|js)     # the automation
├── config             # settings at top, human-editable
├── ledger.json        # record of every unit of work completed
├── run.log            # append-only log of every action and skip
├── STOP               # kill switch: if this file exists, exit before any external action
└── README.md          # written in Phase 6
```

Build requirements:

- **DRY_RUN defaults to true.** In dry-run, produce the exact real output (the email body, the CRM payload, the post) and log it instead of sending it. Going live requires an approved APPROVAL REQUESTED plus a deliberate config change — two locks, not one.
- **Idempotent via the ledger.** Before acting on any unit of work, check the ledger; after acting, record it. Re-running must never double-send, double-post, or double-write.
- **Kill switch checked first.** Every run begins by checking for the STOP file and checks again immediately before each external action. If STOP exists, exit cleanly and log the halt.
- **Log everything.** Timestamp, action or skip, reason, dry-run or live.
- **Secrets from existing environment only.** Never hardcode credentials, never create new keys or accounts, never sign up for anything.
- **Scheduling uses what exists** — cron, launchd, Task Scheduler, or a documented manual trigger. No paid schedulers.
- **First live run is minimal blast radius** — pointed at the operator themselves (their own inbox, their own number, a sandbox record) before it ever touches a client or the public.

## Phase 5 — Prove it

Demonstrate three behaviors, each with excerpts from `run.log` and `ledger.json` as evidence:

1. **Real.** A full run in dry-run producing production-shaped output — the actual email that would send, the actual record that would update. If the operator approves, one minimal-blast-radius live run.
2. **Duplicate.** Run it again immediately. Show the ledger causing every already-completed unit to be skipped: zero repeated external actions, skips visible in the log.
3. **Stopped.** Create the STOP file, trigger a run, and show a clean halt — no partial mutations, a clear log entry, and normal resumption after STOP is removed.

No proof, no delivery. If any of the three fails, fix and re-prove.

## Phase 6 — Handoff

Write `README.md` in the workspace covering: what it does and why it was chosen (include the three-option memo), how to run it, how to stop it (the STOP file), how to uninstall it, exactly what it reads and writes, how to roll back its effects, and any approval still pending.

Close in chat with: the discovery brief (what was audited, confirmation every wall was honored), the memo and verdict, the proof log with all three behaviors, and where the README lives.

## Self-check before finishing

- Did anything mutate outside the workspace without an approved request? Must be no.
- Was anything on the walls list opened? Must be no.
- Was any money spent, or any account or key created? Must be no.
- Are all three proofs — real, duplicate, stopped — evidenced in the logs?
- Is the operator profile filled with cited inferences, or explicitly noted as generic?
- Would this survive a stranger reading the README and running it cold?

Any "no" on the first three questions, or missing proof, means the work is not done.

---

## Single-prompt activation (for the operator)

Copy, edit the bracket, send:

> Use the automation-scout skill on my [real estate business / lead follow-up / listing marketing / transaction paperwork / content pipeline / personal life].

Optionally add walls first:

> Before you start — DO_NOT_OPEN: [folder]. DO_NOT_TOUCH: [account]. Now use the automation-scout skill on my [target area].
