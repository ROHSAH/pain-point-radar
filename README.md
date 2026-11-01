# Recycling Pain-Point Agent

Finds and ranks **the top customer pain points in the recycling business by volume** across
**India, Europe (UK + EU) and the US**, using what people search, discuss and complain about on
Reddit, X, YouTube, Google, and complaint/review sites.

```
collect ──► classify (Claude) ──► consolidate themes (Claude) ──► rank by volume ──► report
 Reddit        relevant?              "bin men skipped us",          mentions +            report.md
 X             region / country       "missed pickup again"   ──►    engagement-weighted   pain_points.csv
 YouTube       category (taxonomy)    = "Missed pickups"             volume, per region    pain_points.json
 Google suggest  sub-issue, severity,
 Web (Brave)     verbatim quote
```

## Quick start

```bash
cd recycling-pain-points
npm install
cp .env.example .env          # add the keys you have (see table below)
npm run demo                  # offline demo on synthetic sample data -> out/demo/report.md

node src/cli.js collect                       # fetch documents  -> data/docs.jsonl
node src/cli.js classify --max-docs 200       # small paid test run first
node src/cli.js run                           # full pipeline    -> out/report.md
```

Useful flags: `--regions india,us`, `--sources reddit,suggest`, `--time month`, `--since-days 90`,
`--max-docs 2000` (cost cap), `--top 15`. `node src/cli.js --help` lists everything.

Every stage is **incremental**: re-running `collect` only adds new documents, `classify` only sends
unclassified ones to Claude, and theme clustering is reused when no new phrases appear. Run it weekly
(cron / GitHub Actions) to build up volume and see trends.

## Sources

| Source | What it captures | Channel | Access |
|---|---|---|---|
| Google autocomplete | What people **search** ("why is recycling so expensive", "where to recycle batteries") per country & language | `search` | Free, no key |
| Reddit | Posts **and top comments** in regional subreddits (r/india, r/bangalore, r/AskUK, r/de, r/nyc …) and r/recycling, r/ZeroWaste | `discussion` | Free [Reddit API app](https://www.reddit.com/prefs/apps) (public JSON fallback is blocked from most cloud IPs) |
| X | Complaints @ councils, municipal bodies, haulers (last 7 days) | `social` | X API v2 bearer token (Basic tier+) |
| YouTube | Comments on recycling videos per region | `discussion` | YouTube Data API key (free quota) |
| Web (Brave Search) | Complaint & review sites (consumercomplaints.in, MouthShut, Trustpilot, ComplaintsBoard), Quora, forums — **snippets only** | `review` / `discussion` | Brave Search API key (free tier) |

What to search is all in [`config/regions.json`](config/regions.json): queries, subreddits, X queries,
autocomplete seeds and languages (German, French, Spanish, Italian, Dutch seeds are included for
Europe). Add cities, brands (Recykal, Kabadiwalla Connect, Biffa, Veolia, WM, Republic Services),
or new regions — no code changes needed.

## How pain points are identified and ranked

1. **Classify** — Claude reads documents in batches of 20 and returns, per document: is it a real
   customer pain point, region/country, up to 3 pain points each with a category from
   [`config/taxonomy.json`](config/taxonomy.json), a short reusable *sub-issue* phrase, severity 1–5, and
   a verbatim quote. Works in any language; output is English.
2. **Consolidate** — per category, Claude clusters the free-text sub-issues into 3–12 named themes
   (e.g. *"Scrap buyers cheat on weight"*), so new problems surface even if the taxonomy didn't
   anticipate them (watch the `other` category for those).
3. **Rank** — per region:
   - **mentions** = distinct documents raising the pain point (a document counts once per category)
   - **weighted volume** = Σ `1 + log10(1 + upvotes/likes + replies)` — agreement counts, but a single
     viral thread can't dominate
   - **% of relevant** — use this to compare regions, since sample sizes differ
   - **channel mix** — high `search` / low `discussion` = information gap; the reverse = a service
     failure people vent about.

### Outputs (`out/`, regenerated on every run)

| File | What's in it |
|---|---|
| `dashboard.html` | Self-contained dashboard. Filters by region, persona, pain point, source, channel, severity and free text; KPI tiles; ranked volume bars; two **pivot tables where you pick any two parameters to club the data** (pain point × region, pain point × persona, theme × country, …); a channel-mix chart; and the paginated **verbatim complaint log** with links back to each post. Copy or download the filtered rows as CSV. |
| `complaints.csv` | One row per pain-point mention: region, country, persona, pain point, theme, severity, source, engagement, date, quote, full verbatim text, URL. |
| `documents.csv` | Everything collected, relevant or not. |
| `report.md`, `pain_points.csv`, `pain_points.json` | Ranked summaries per region, incl. persona and channel breakdowns. |

A real-data example run is in [`samples/2026-10-31-google-search/`](samples/2026-10-31-google-search/).

### Personas

Each document is tagged with who is speaking (from `config/taxonomy.json`): homeowner, apartment /
society resident, landlord or society manager, small business, scrap seller / deposit redeemer,
eco-conscious zero-waster, waste worker / insider, or general citizen when it can't be told. Personas
come mostly from Reddit and forum posts, where people say "our society", "my landlord", "I run a café".
Search queries rarely reveal who is searching.

### Classifiers

`--classifier auto` (default) uses Claude when an API key or `ant` profile is present, otherwise the
keyword classifier in `src/ruleClassifier.js`. The keyword classifier is free and transparent but
literal; it is fine for search queries and weak on long Reddit threads. A later Claude run re-labels
rows the keyword classifier labelled.

## Cost

Classification uses `claude-opus-5-5` at low effort with the stable instructions prompt-cached;
budget roughly **$3–6 per 1,000 documents** (search queries are cheaper, long posts dearer) (thinking tokens vary — check with a
`--max-docs 200` run first). Set `CLAUDE_MODEL=claude-haiku-5-5` for a much cheaper bulk run. Long posts are
clipped to 1,500 characters before classification. Server-side refusal fallback
(`fallbacks: "default"`) is enabled so a declined batch is retried on a fallback model instead of being lost.

## Limits & responsible use

- **Volumes are in-sample**, shaped by your queries and each API's limits (X recent search = 7 days,
  Reddit search returns ≤ ~250 results per query). They show relative ranking, not market size.
- Google autocomplete localisation is influenced by the caller's IP as well as `gl`; run from (or proxy
  through) the target country for cleaner country-level search signals.
- Uses official APIs only, and only titles/snippets from search results — no crawling of sites whose
  terms forbid scraping. Respect each platform's developer terms (Reddit and X restrict commercial use
  and redistribution of content; check your tier).
- Author names/handles are **not stored**. Keep `data/` private; it is git-ignored.
- `test/fixtures/` holds **synthetic** examples (example.com links) for the demo and tests — not findings.

## Development

```bash
npm test                 # unit tests for ranking, dedupe, normalisation, reports
node test/fixtures/make-fixtures.js   # regenerate the synthetic fixtures
```

Layout: `src/sources/*` (one collector per platform, all emit the same document shape),
`src/classify.js`, `src/consolidate.js`, `src/aggregate.js` (pure ranking logic), `src/report.js`,
`src/cli.js`.
