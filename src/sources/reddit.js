// Reddit collector.
// Preferred: official OAuth API (app-only, "client_credentials") - set REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET
// (create a "script" app at https://www.reddit.com/prefs/apps). Falls back to the public .json endpoints,
// which are heavily rate-limited and blocked from many cloud IPs.
import { httpJson, makeDoc, sleep, log } from "../util.js";

let token = null;
let tokenExpiry = 0;

async function getToken() {
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (token && Date.now() < tokenExpiry) return token;
  const res = await httpJson("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    label: "reddit-auth",
  });
  token = res.access_token;
  tokenExpiry = Date.now() + (res.expires_in - 60) * 1000;
  return token;
}

async function redditGet(pathAndQuery) {
  const t = await getToken();
  const base = t ? "https://oauth.reddit.com" : "https://www.reddit.com";
  const [p, q] = pathAndQuery.split("?");
  const url = `${base}${p}${t ? "" : ".json"}?${q || ""}&raw_json=1`;
  const res = await httpJson(url, { headers: t ? { Authorization: `Bearer ${t}` } : {}, label: "reddit" });
  await sleep(t ? 700 : 2500); // stay well under 100 req/min (OAuth) / ~10 req/min (public)
  return res;
}

function postToDoc(p, regionHint, query) {
  return makeDoc({
    source: "reddit",
    channel: "discussion",
    nativeId: p.name, // t3_xxx
    regionHint,
    query,
    url: `https://www.reddit.com${p.permalink}`,
    title: p.title,
    text: `${p.title}\n\n${p.selftext || ""}`.trim(),
    createdAt: new Date(p.created_utc * 1000).toISOString(),
    score: p.score,
    comments: p.num_comments,
  });
}

/**
 * @param {object} region   region config from config/regions.json
 * @param {string} regionId
 * @param {object} opts     { limit, timeWindow, commentsPerPost, commentPosts }
 */
export async function collectReddit(region, regionId, opts) {
  const docs = [];
  const t = opts.timeWindow || "year";
  const perQuery = Math.min(100, opts.limit);
  const subs = region.subreddits || [];
  const queries = region.queries || [];

  const jobs = [];
  // 1) each query restricted to the region's subreddits (high regional precision)
  if (subs.length) {
    const multi = subs.join("+");
    for (const q of queries) jobs.push({ path: `/r/${multi}/search?q=${encodeURIComponent(q)}&restrict_sr=1&sort=relevance&t=${t}&limit=${perQuery}`, q });
  }
  // 2) topic-themed search inside every regional subreddit (topic.json "subreddit_query")
  if (opts.subredditQuery) for (const s of subs) jobs.push({ path: `/r/${s}/search?q=${encodeURIComponent(opts.subredditQuery)}&restrict_sr=1&sort=relevance&t=${t}&limit=${perQuery}`, q: `r/${s} ${opts.subredditQuery}` });

  for (const job of jobs) {
    try {
      const res = await redditGet(job.path);
      for (const child of res?.data?.children || []) docs.push(postToDoc(child.data, regionId, job.q));
    } catch (err) {
      log(`reddit: ${job.q} failed: ${err.message}`);
      if (/HTTP 403/.test(err.message) && !process.env.REDDIT_CLIENT_ID) {
        log("reddit: public endpoint blocked - set REDDIT_CLIENT_ID/REDDIT_CLIENT_SECRET to use the official API");
        break;
      }
    }
  }

  // 3) top comments from the most-discussed posts - this is where most of the complaining happens
  const uniq = new Map(docs.map((d) => [d.id, d]));
  const top = [...uniq.values()].sort((a, b) => b.engagement.comments - a.engagement.comments).slice(0, opts.commentPosts ?? 20);
  for (const post of top) {
    try {
      const id = post.id.split(":")[1].replace(/^t3_/, "");
      const res = await redditGet(`/comments/${id}?sort=top&limit=${opts.commentsPerPost ?? 15}&depth=1`);
      for (const c of res?.[1]?.data?.children || []) {
        if (c.kind !== "t1" || !c.data.body || c.data.body === "[deleted]") continue;
        docs.push(
          makeDoc({
            source: "reddit",
            channel: "discussion",
            nativeId: c.data.name,
            regionHint: regionId,
            query: post.query,
            url: `https://www.reddit.com${c.data.permalink}`,
            title: `Re: ${post.title}`,
            text: c.data.body,
            createdAt: new Date(c.data.created_utc * 1000).toISOString(),
            score: c.data.score,
          }),
        );
      }
    } catch (err) {
      log(`reddit comments ${post.id} failed: ${err.message}`);
    }
  }
  return docs;
}
