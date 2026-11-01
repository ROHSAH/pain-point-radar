# Snapshot: 1 Nov 2026, Google search queries only

Real Google autocomplete data for 13 topics (India `gl=in`, Europe `gl=gb` plus a few non-English
seeds, US `gl=us`): **20,010 search queries, 17,215 pain-point mentions**.

Open `dashboard.html`. It starts on **All topics**: the first table shows which pain points hit which
industry, the second compares topics by region. Pick a topic to see its own pain points and personas.
Each topic folder has `complaints.csv` (every mention, verbatim) and `report.md` (ranked per region).

- Labelled with the **keyword classifier** (no Claude key was available). Most searches are questions,
  so *How-to questions & confusing rules* is large in every topic; the topic-specific categories
  (e.g. credit score problems, power cuts, claims rejected) are the more telling signal.
- **Reddit, X, YouTube and complaint sites are not in this snapshot**: no API keys were set, and
  Reddit refuses anonymous requests from cloud servers.
- Search queries rarely reveal who is searching, so almost every row has the general persona.
