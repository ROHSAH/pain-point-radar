# Snapshot: 1 Nov 2026, Google search queries only

Real Google autocomplete data for 13 topics (India `gl=in`, Europe `gl=gb` plus a few non-English
seeds, US `gl=us`): **20,010 search queries, about 9,800 pain-point mentions**.

Open `dashboard.html`. It starts on **All topics**: the first table shows which pain points hit which
industry, the second compares topics by region. Pick a topic to see its own pain points and personas.
Each topic folder has `complaints.csv` (every mention, verbatim) and `report.md` (ranked per region).

- Each topic uses its own pain points and personas (no shared generic categories).
- Labelled with the **keyword classifier** (no Claude key was available), so plain informational
  searches with no problem signal are left out rather than forced into a category.
- **Reddit, X, YouTube and complaint sites are not in this snapshot**: no API keys were set, and
  Reddit refuses anonymous requests from cloud servers.
- Search queries rarely reveal who is searching, so almost every row has the general persona.
