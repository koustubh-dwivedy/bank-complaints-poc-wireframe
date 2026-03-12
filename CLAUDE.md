# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the prototype

```bash
# Start the dev server (port 8787) — required for browser error logging to work
python3 server.py

# Then open in browser
open http://localhost:8787/index.html
```

No build step, no package manager, no compilation. All files are served as-is. The server also accepts `POST /log` from the in-page error capture script and writes to `browser_logs.txt` — this is how browser JS errors are tracked.

To check live browser errors while a user navigates:
```bash
tail -f browser_logs.txt
```

## Architecture

This is a **no-framework static prototype** — vanilla JS, Tailwind CDN, one CSS file. All state lives in global `window.*` objects. There is no module system; scripts are loaded in dependency order via `<script>` tags in each HTML file.

### Pages and their script dependencies

Each HTML page loads scripts in this order: data files → `app.js` → feature modules → page-specific init.

| Page | URL pattern | Modules loaded |
|---|---|---|
| `index.html` | `/` | `queue.js` |
| `case.html` | `/?case=CASE-XXXX` | `copilot.js`, `queue.js`, `timeline.js`, `panels.js` |
| `supervisor.html` | `/supervisor.html` | `supervisor.js` |

**Critical:** `app.js` fires `DOMContentLoaded` which calls `init()` on whichever of `QUEUE`, `TIMELINE`, `SUPERVISOR` are defined on the page. Never call `QUEUE.openCase()` from within `APP.init()` — that caused an infinite reload loop (case.html has `?case=` in the URL, so openCase would navigate to itself repeatedly).

### Global objects and responsibilities

- **`window.APP`** (`app.js`) — Shared state (current case/tab, PII reveal log), utility formatters (`formatSLACountdown`, `getCategoryColor`, `getIconSVG`, etc.), tab switching for Panel 3 (`.p3-tab`/`.p3-content`) and Panel 4 (`.p4-tab`/`.p4-content`).
- **`window.QUEUE`** (`queue.js`) — Renders queue cards, handles filters/pinning/search. Navigates to `case.html?case=ID` on click.
- **`window.TIMELINE`** (`timeline.js`) — Reads `?case=` from URL, renders touchpoint rows from `TOUCHPOINTS[caseId]`, calls `PANELS.showTouchpointDetail(tp)` on row click.
- **`window.PANELS`** (`panels.js`) — The largest module. Owns all Panel 3 and Panel 4 rendering: case header, SLA bar, active flag banners, touchpoint detail, documents, PII masking/reveal, notes, and all five AI Copilot tabs. Also owns `PANELS.piiRevealed` state and `PANELS.aiInteractionLog`.
- **`window.COPILOT`** (`copilot.js`) — Pure data: hardcoded AI responses keyed by `caseId`. Methods: `getSummary()`, `getInvestigationMemo()`, `getDraftResponse()`, `getPrecedents()`.
- **`window.SUPERVISOR`** (`supervisor.js`) — Reads `window.CASES` directly, renders the team queue table, workload summary, and SLA breach alerts.

### Data layer

All data is in `js/data/` as `window.*` globals:

- `window.CASES` — array of case objects. Each case has `sla` (object of `{label, deadline}` entries), `regulationTags[]`, `flags`, `linkedCases[]`.
- `window.CUSTOMERS` — keyed by `CUST-XXXXX`. Each customer has both masked and full versions of every PII field (e.g. `maskedSSN` / `fullSSN`). The `flags` object drives the banner system in `PANELS.renderFlags()`.
- `window.TOUCHPOINTS` — keyed by `caseId`. Each touchpoint has a `category` (drives color), `icon` (maps to SVG in `APP.getIconSVG()`), and `aiFlag` (null or `{severity, message}`).
- `window.DOCUMENTS` — keyed by `caseId`.

### SLA color logic

SLA deadlines are stored as ISO strings. `APP.formatSLACountdown(deadline)` returns `{text, status}` where status is `red` (overdue or ≤2 days), `amber` (≤7 days), or `green`. The "worst SLA" across all clocks on a case is what appears on queue cards and in the SLA bar.

### PII masking pattern

`PANELS.revealPIIWithPrompt(field, maskedVal, fullVal)` prompts for a justification code, calls `APP.revealPII()` (appends to `APP.piiAccessLog`), sets `PANELS.piiRevealed[field] = true`, then re-renders `renderCustomerPII()`. The full value only renders if `piiRevealed[field]` is truthy.

### Adding a new case

1. Add a case object to `window.CASES` in `js/data/cases.js`
2. Add the customer to `window.CUSTOMERS` in `js/data/customers.js` (if new)
3. Add touchpoints array keyed by the new case ID in `window.TOUCHPOINTS` in `js/data/touchpoints.js`
4. Optionally add documents to `window.DOCUMENTS` in the same file
5. Optionally add mocked AI responses in `js/copilot.js` (`getSummary`, `getInvestigationMemo`, `getDraftResponse`)

### Adding a new touchpoint category

1. Add color in `APP.getCategoryColor()` in `app.js`
2. Add label in `APP.getCategoryLabel()` in `app.js`
3. Add a filter button in the timeline filter bar in `case.html`

## Keeping this file current

Update `CLAUDE.md` whenever you make a structural change to the codebase — new module, new global object, new data field, new page, architectural decision, or a bug fix that reveals a non-obvious constraint (e.g. the infinite-reload footgun documented above). Do not log every small UI tweak, but do capture anything a future Claude instance would need to read multiple files to understand.

## Pushing to GitHub

After every meaningful set of changes, commit and push to the `main` branch of the GitHub repository. Write commit messages in this format:

```
<type>: <short imperative summary>

<what changed and why — reference specific files and functions>
<any non-obvious side effects or constraints introduced>
<bug fixes: describe the root cause, not just the symptom>
```

Types: `feat` (new feature/page), `fix` (bug), `data` (mock data changes), `style` (UI/CSS only), `docs` (CLAUDE.md or comments), `chore` (server, config).

Example of a good commit message:
```
fix: remove infinite reload loop on case.html

APP.init() was calling QUEUE.openCase() whenever a ?case= param was
present in the URL. On case.html this caused an immediate navigation
back to case.html, reloading the page endlessly. Removed the redirect
logic from APP.init() entirely — case.html initialises itself via
PANELS.init() and TIMELINE.init() which already read the URL param.
```

Push after: adding/editing mock data, fixing bugs, adding new UI features, and always before ending a work session.

## Mock data reference

| Case ID | Scenario | Regulations | Notable flags |
|---|---|---|---|
| `CASE-2024-0441` | Unauthorized ACH × 3 | Reg E, UDAAP | SLA overdue, CFPB filed same day |
| `CASE-2024-0388` | FCRA tradeline error → mortgage denial | FCRA, CFPB | Fraud hold, SLA overdue |
| `CASE-2024-0512` | Overdraft fee UDAAP + bankruptcy auto-stay | CFPB, UDAAP, Reg E | Bankruptcy + legal hold |
| `CASE-2024-0477` | SCRA rate cap not applied × 2 billing cycles | SCRA, MLA, Reg Z | Military SCRA flag |
| `CASE-2024-0390` | Resolved card-not-present fraud | Reg E | Has `determination` populated |
