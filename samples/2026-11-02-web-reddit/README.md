# Snapshot: 2 Nov 2026, adds complaint sites and Reddit (via search)

For **Small vendors & sellers** and **MSME & B2B lending**, this run adds Brave Search results
(143 API calls) on top of the Google search data:

- Complaint and review sites: consumercomplaints.in, MouthShut, Voxya (India); Trustpilot,
  MoneySavingExpert, Which?, Financial Ombudsman decisions (UK); BBB, ConsumerAffairs,
  ComplaintsBoard (US). Titles and search snippets only.
- Reddit threads found through search (`site:reddit.com/r/...`), shown as "Reddit (via search)":
  post titles and snippets, not full threads or comments.
- Lender marketing pages ("benefits, eligibility", "apply now", app-store listings) are filtered out.
- Complaint-site results must name the searched brand in their title or description (sites list
  complaints about every company), and ambiguous names are filtered.
- Still labelled by the keyword classifier (no Claude key).

`dashboard.html` here includes all 15 topics; each topic folder has `complaints.csv` with verbatim
text and source links.
