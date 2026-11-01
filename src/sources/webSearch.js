// "Everywhere else" collector: complaint sites, review sites, forums, Q&A, news comments.
// Uses the Brave Search API (BRAVE_API_KEY, free tier available) and keeps only the result
// title + snippet + extra snippets - it does NOT crawl the result pages, which keeps us inside
// the terms of sites like Trustpilot / MouthShut that prohibit scraping.
import { httpJson, makeDoc, sleep, log } from "../util.js";

export async function collectWebSearch(region, regionId, opts) {
  const key = process.env.BRAVE_API_KEY;
  if (!key) {
    log("web: BRAVE_API_KEY not set - skipping");
    return [];
  }
  const docs = [];
  for (const q of region.web_queries || []) {
    for (let offset = 0; offset < (opts.webPages ?? 2); offset++) {
      const params = new URLSearchParams({ q, count: "20", offset: String(offset), extra_snippets: "true" });
      if (region.brave?.country) params.set("country", region.brave.country);
      try {
        const res = await httpJson(`https://api.search.brave.com/res/v1/web/search?${params}`, {
          headers: { Accept: "application/json", "X-Subscription-Token": key },
          label: "brave",
        });
        const results = [...(res.web?.results || []), ...(res.discussions?.results || [])];
        for (const r of results) {
          docs.push(
            makeDoc({
              source: "web",
              channel: /trustpilot|mouthshut|complaint|consumercomplaints|yelp|sitejabber/i.test(r.url) ? "review" : "discussion",
              nativeId: r.url,
              regionHint: regionId,
              query: q,
              url: r.url,
              title: r.title,
              text: [r.title, r.description, ...(r.extra_snippets || [])].join("\n"),
              createdAt: r.page_age || null,
            }),
          );
        }
        if (!res.query?.more_results_available) break;
      } catch (err) {
        log(`web "${q}" failed: ${err.message}`);
        break;
      }
      await sleep(1100); // free tier: 1 req/s
    }
  }
  return docs;
}
