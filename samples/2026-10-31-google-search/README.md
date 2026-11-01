# Snapshot: 31 Oct 2026, Google search queries only

Real data, collected with `node src/cli.js run --regions india,europe,us`:

- **1,487 Google autocomplete queries** (India `gl=in`; Europe `gl=gb` plus German, French,
  Spanish, Italian, Dutch; US `gl=us`), of which **820 express a pain point** (977 mentions).
- Labelled with the **keyword classifier** (`model: rules`) because no Claude key was available.
  No theme clustering was run.
- **Reddit, X, YouTube and complaint sites are not in this snapshot.** The machine it ran on had no
  API keys, and Reddit's public endpoint refuses cloud IPs. Re-run with keys to add them.
- Search queries rarely reveal who is searching, so ~90% of rows have persona *General citizen*. Personas
  come mainly from Reddit/forum posts, where people describe their housing, business or role.
- Autocomplete localisation also follows the caller's IP; region is corrected from place names in the
  query where present.

Files: `dashboard.html` (open in a browser), `complaints.csv` (one row per pain-point mention, verbatim),
`documents.csv` (everything collected), `report.md`, `pain_points.csv`.
