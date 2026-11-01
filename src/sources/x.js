// X (Twitter) collector - official API v2 recent search (last 7 days).
// Requires X_BEARER_TOKEN from a developer account on a tier that includes search (Basic or above).
import { httpJson, makeDoc, sleep, log } from "../util.js";

export async function collectX(region, regionId, opts) {
  const bearer = process.env.X_BEARER_TOKEN;
  if (!bearer) {
    log("x: X_BEARER_TOKEN not set - skipping");
    return [];
  }
  const docs = [];
  for (const q of region.x_queries || []) {
    let nextToken = null;
    let fetched = 0;
    do {
      const params = new URLSearchParams({
        query: q.includes("-is:retweet") ? q : `${q} -is:retweet`,
        max_results: "100",
        "tweet.fields": "created_at,public_metrics,lang",
      });
      if (nextToken) params.set("next_token", nextToken);
      let res;
      try {
        res = await httpJson(`https://api.x.com/2/tweets/search/recent?${params}`, {
          headers: { Authorization: `Bearer ${bearer}` },
          label: "x",
        });
      } catch (err) {
        log(`x: query failed: ${err.message}`);
        break;
      }
      for (const t of res.data || []) {
        const m = t.public_metrics || {};
        docs.push(
          makeDoc({
            source: "x",
            channel: "social",
            nativeId: t.id,
            regionHint: regionId,
            query: q,
            url: `https://x.com/i/web/status/${t.id}`,
            text: t.text,
            createdAt: t.created_at,
            score: (m.like_count || 0) + (m.retweet_count || 0) + (m.quote_count || 0),
            comments: m.reply_count || 0,
            lang: t.lang,
          }),
        );
      }
      fetched += res.meta?.result_count || 0;
      nextToken = res.meta?.next_token;
      await sleep(1100);
    } while (nextToken && fetched < opts.limit);
  }
  return docs;
}
