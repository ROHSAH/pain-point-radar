# Snapshot: 1 Nov 2026, Google search queries only

Real data from Google autocomplete for three topics (India `gl=in`, Europe `gl=gb` plus a few
non-English seeds, US `gl=us`):

| Topic | Search queries collected | Pain-point mentions |
|---|---:|---:|
| Recycling | 1,487 | 977 |
| EV charging | 1,405 | 883 |
| Food delivery | 1,688 | 1,255 |

- Open `dashboard.html` and pick a topic from the **Topic** dropdown; the Pain point and Persona
  dropdowns then show that topic's own categories.
- Labelled with the **keyword classifier** (no Claude key was available). Recycling uses hand-tuned
  rules; EV charging and food delivery use the generic template categories, which are coarser
  (e.g. many "how to…" searches land in *Confusing information & rules*).
- **Reddit, X, YouTube and complaint sites are not in this snapshot**: no API keys were set, and
  Reddit refuses anonymous requests from cloud servers.
- Search queries rarely reveal who is searching, so almost every row has the general persona.
