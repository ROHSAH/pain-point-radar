// "Everywhere else" collector: complaint sites, review sites, forums, Q&A - and Reddit threads.
// Uses the Brave Search API (BRAVE_API_KEY, free tier available) and keeps only the result
// title + snippet + extra snippets - it does NOT crawl the result pages, which keeps us inside
// the terms of sites like Trustpilot / MouthShut that prohibit scraping.
//
// Reddit via search: when the official Reddit API isn't available, it also searches
// "<query> site:reddit.com/r/<subreddit>" for the region's subreddits. Those results are tagged
// source "reddit_search": real Reddit posts, but only their title and search snippet, not full
// threads or comments (use the Reddit collector with API keys for that).
import { httpJson, makeDoc, sleep, log } from "../util.js";
import { createBudget, BudgetExhausted } from "./braveBudget.js";

// One budget per process, shared by every region and topic in the run.
let budget = null;

const REVIEW_SITES = /trustpilot|mouthshut|complaint|consumercomplaints|consumeraffairs|bbb\.org|voxya|yelp|sitejabber|which\.co\.uk/i;

async function braveSearch(q, region, key, offset) {
  budget.reserve();
  const params = new URLSearchParams({ q, count: "20", offset: String(offset), extra_snippets: "true" });
  if (region.brave?.country) params.set("country", region.brave.country);
  const res = await httpJson(`https://api.search.brave.com/res/v1/web/search?${params}`, {
    headers: { Accept: "application/json", "X-Subscription-Token": key },
    label: "brave",
    retries: 0, // a 429 here usually means the quota is used up: stop instead of retrying
  });
  await sleep(1100); // free tier: 1 request/second
  return res;
}

/**
 * For "<brand> complaint site:<complaint site>" queries, the first word of the query (the brand or
 * product) must appear in a result. Returns null for other queries, including Reddit searches.
 */
export function siteQueryTerm(q) {
  const m = q.match(/^(.+?) complaint site:(?!reddit)/i);
  if (!m) return null;
  const word = m[1].trim().split(/\s+/)[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${word}`, "i");
}

/** Reddit-targeted searches: the region's first few subreddits x its first few problem queries. */
export function redditSearchQueries(region, { subs = 3, queries = 2 } = {}) {
  const out = [];
  for (const sub of (region.subreddits || []).slice(0, subs)) {
    for (const q of (region.queries || []).slice(0, queries)) out.push(`${q} site:reddit.com/r/${sub}`);
  }
  return out;
}

export async function collectWebSearch(region, regionId, opts) {
  const key = process.env.BRAVE_API_KEY;
  if (!key) {
    log("web: BRAVE_API_KEY not set - skipping");
    return [];
  }
  const plan = [
    ...(region.web_queries || []).map((q) => ({ q, pages: opts.webPages ?? 2 })),
    // One page each: the top Reddit threads are what matter, and it keeps a full run inside the free quota.
    ...(opts.redditViaSearch === false ? [] : redditSearchQueries(region).map((q) => ({ q, pages: 1 }))),
  ];
  budget ??= createBudget({ perRun: opts.maxWebCalls ?? 300 });
  if (budget.stopped) return [];
  const docs = [];
  outer: for (const { q, pages } of plan) {
    for (let offset = 0; offset < pages; offset++) {
      const cacheKey = `${region.brave?.country || ""}|${q}|${offset}`;
      if (budget.seenRecently(cacheKey)) continue;
      let res;
      try {
        res = await braveSearch(q, region, key, offset);
      } catch (err) {
        if (err instanceof BudgetExhausted || /HTTP 429/.test(err.message)) {
          log(`web: stopping - ${err instanceof BudgetExhausted ? err.message : "Brave returned 429 (rate or quota limit)"}`);
          budget.stopped = true;
          break outer;
        }
        log(`web "${q}" failed: ${err.message}`);
        break;
      }
      budget.done(cacheKey);
      const results = [...(res.web?.results || []), ...(res.discussions?.results || [])];
      const mustMention = siteQueryTerm(q);
      for (const r of results) {
        // Complaint sites return complaints about every company; keep only those about the brand searched for.
        if (mustMention && !mustMention.test(`${r.title} ${r.description}`)) continue;
        const isReddit = /(^|\.)reddit\.com\//i.test(r.url.replace(/^https?:\/\//, ""));
        docs.push(
          makeDoc({
            source: isReddit ? "reddit_search" : "web",
            channel: isReddit ? "discussion" : REVIEW_SITES.test(r.url) ? "review" : "discussion",
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
    }
  }
  budget.flush();
  return docs;
}
