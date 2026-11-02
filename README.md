# Pain-Point Radar

Finds and ranks **customer pain points by volume for any industry or topic** (recycling, EV charging,
food delivery, banking, telecom...) across **India, Europe (UK + EU) and the US**. It reads what people
search, discuss and complain about on Reddit, X, YouTube, Google and complaint/review sites.

```
collect ──► classify ──► group into themes ──► rank by volume ──► report + dashboard
Reddit       pain point, persona,   (Claude)          per region, per topic   Topic ▾ Region ▾ Persona ▾
X            region, severity,                                                 Pain point ▾ Source ▾ ...
YouTube      verbatim quote
Google search
Web / complaint sites
```

## Quick start

```bash
npm install
cp .env.example .env                  # add the keys you have (see Sources)
node src/cli.js topics                # lists the 14 topics
node src/cli.js run --topic recycling # collect -> classify -> report
open out/dashboard.html               # all topics, with a Topic dropdown
```

## Topics

14 starter topics ship with the repo:

| Area | Topics (`--topic` id) |
|---|---|
| Finance | Banking & payments (`banking-payments`), Consumer loans & lending (`lending-loans`), **MSME & B2B lending** (`msme-lending`), Insurance (`insurance`) |
| Energy & environment | Home energy & electricity (`energy-utilities`), EV charging (`ev-charging`), Recycling (`recycling`) |
| Everyday services | Mobile & internet (`telecom-internet`), Online shopping (`ecommerce`), Food delivery (`food-delivery`), Ride-hailing & taxis (`ride-hailing`) |
| Life & home | Healthcare & hospitals (`healthcare`), Renting & housing (`renting-housing`), Air travel (`air-travel`) |

Each topic has its **own** pain points and personas **for each region**, written in that market's
terms (see `scripts/topic-taxonomies.js`). MSME lending in India tracks Mudra/CGTMSE hurdles,
collateral demands, OD/CC limits, the 45-day payment rule and TReDS for traders, MSE manufacturers
and GeM suppliers; in Europe, Bounce Back Loan repayments, personal guarantees and withdrawn
overdrafts for sole traders and limited-company directors; in the US, SBA delays, merchant-cash-advance
traps and Paydex credit for LLC owners and 1099 contractors. Category and persona ids carry a region
prefix (`in_`, `eu_`, `us_`), and the classifier only picks from the document's own region. For example, lending tracks recovery-agent harassment, illegal loan
apps, credit-score problems, BNPL traps, EMI and rate hikes; energy tracks power cuts, smart and
prepaid meters, net metering and discom support; ride-hailing tracks drivers demanding extra cash,
cancellations and surge. `node scripts/starter-topics.js` rewrites the taxonomies from that file.

Each topic is a folder in `topics/<id>/`:

| File | What it sets |
|---|---|
| `topic.json` | Name, scope, words that mark a text as on-topic, Reddit search query |
| `regions.json` | Per region: subreddits, search queries, Google autocomplete seeds, X and web queries |
| `taxonomy.json` | Pain-point categories and personas, each with optional keyword patterns |
| `rules.js` | Optional hand-tuned keyword classifier (recycling has one) |

Add a new topic:

```bash
node src/cli.js new-topic banking --label "Retail banking" \
  --description "Personal bank accounts, cards and UPI/payments: fees, fraud, blocked cards, support"
node src/cli.js run --topic banking
```

With an Anthropic API key, Claude drafts topic-specific subreddits, queries, pain points and personas.
Without one, you get a placeholder template with generic categories; replace them with the
industry's own before relying on the results.

## Sources

| Source | What it captures | Channel | Access |
|---|---|---|---|
| Google autocomplete | What people **search**, per country & language | `search` | Free, no key |
| Reddit | Posts **and top comments** in each topic's subreddits | `discussion` | `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` from a Reddit "script" app. Reddit refuses anonymous requests from cloud servers, and new apps may need API approval under its Responsible Builder Policy |
| X | Recent posts (last 7 days) | `social` | `X_BEARER_TOKEN` (paid Basic tier or above) |
| YouTube | Comments on topic videos per region | `discussion` | `YOUTUBE_API_KEY` (free quota) |
| Web (Brave Search) | Complaint & review sites, forums, Quora (snippets only) | `review` / `discussion` | `BRAVE_API_KEY` (free tier) |

Sources without keys are skipped with a message; nothing is faked.

## Classification

`--classifier auto` (default) uses **Claude** when `ANTHROPIC_API_KEY` (or an `ant` profile) is set.
Claude reads posts in any language, assigns up to 3 pain points per post, a persona, region,
severity 1-5 and a verbatim quote, then clusters the specific issues into themes.

Without a key it falls back to the **keyword classifier**, which matches the patterns in the topic's
`taxonomy.json`. It's free and transparent but literal; fine for search queries, weak on long threads.
A later Claude run re-labels everything.

## How volume is ranked

- **Mentions**: distinct posts/comments/reviews/searches raising a pain point (once per category).
- **Weighted volume**: each mention counts `1 + log10(1 + upvotes/likes + replies)`, so agreement
  counts but one viral thread can't dominate.
- **% of relevant**: use this to compare regions, since sample sizes differ.
- **Channel mix**: heavy `search` with little `discussion` suggests an information gap; the reverse
  suggests a service failure people vent about.

Volumes are in-sample (they depend on your queries and each API's limits), so they show relative
ranking, not market size.

## Outputs

| File | What's in it |
|---|---|
| `out/dashboard.html` | All topics. **Topic** dropdown, then region, persona, pain point, source, channel, severity and text filters; KPI tiles; ranked bars; two pivot tables over any two parameters; channel mix; paginated **verbatim complaint log** with source links; CSV copy/download |
| `out/<topic>/complaints.csv` | One row per mention: region, country, persona, pain point, theme, severity, source, engagement, date, quote, full text, URL |
| `out/<topic>/documents.csv` | Everything collected |
| `out/<topic>/report.md`, `pain_points.csv`, `pain_points.json` | Ranked summaries per region |

A real-data example is in [`samples/2026-11-01-google-search/`](samples/2026-11-01-google-search/).

## Cost

Classification uses `claude-opus-5-5` at low effort with the instructions prompt-cached. Rough
estimate: **$3–6 per 1,000 documents**; check with `--max-docs 200` first.
`CLAUDE_MODEL=claude-haiku-5-5` is much cheaper. Server-side refusal fallback is enabled.

## Responsible use

Official APIs only, and only titles/snippets from search results. No crawling of sites whose terms
forbid it. Author names are not stored. Keep `data/` private (git-ignored). Reddit and X restrict
commercial use and redistribution of content; check your API tier.

## Development

```bash
npm test
```

`src/sources/*` one collector per platform · `src/topic.js` topic loader · `src/classify.js` Claude
classifier · `src/keywordClassifier.js` no-key fallback · `src/consolidate.js` themes ·
`src/aggregate.js` ranking · `src/report.js`, `src/dashboard.js` outputs · `src/newTopic.js` topic drafting.
