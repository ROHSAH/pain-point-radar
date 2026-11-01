// YouTube collector - YouTube Data API v3 (free quota: 10k units/day; search = 100 units, comments = 1 unit).
// Finds topic videos per region, then pulls their most relevant comments.
import { httpJson, makeDoc, log } from "../util.js";

const API = "https://www.googleapis.com/youtube/v3";

export async function collectYouTube(region, regionId, opts) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    log("youtube: YOUTUBE_API_KEY not set - skipping");
    return [];
  }
  const docs = [];
  const regionCode = region.youtube?.regionCode;
  const queries = (region.queries || []).slice(0, opts.youtubeQueries ?? 5);
  const videos = new Map();
  for (const q of queries) {
    const params = new URLSearchParams({ part: "snippet", q, type: "video", maxResults: "10", order: "relevance", key });
    if (regionCode) params.set("regionCode", regionCode);
    try {
      const res = await httpJson(`${API}/search?${params}`, { label: "youtube" });
      for (const it of res.items || []) videos.set(it.id.videoId, { q, title: it.snippet.title });
    } catch (err) {
      log(`youtube search failed: ${err.message}`);
    }
  }
  for (const [videoId, meta] of videos) {
    const params = new URLSearchParams({ part: "snippet", videoId, maxResults: String(Math.min(100, opts.commentsPerVideo ?? 50)), order: "relevance", textFormat: "plainText", key });
    try {
      const res = await httpJson(`${API}/commentThreads?${params}`, { label: "youtube" });
      for (const th of res.items || []) {
        const c = th.snippet.topLevelComment.snippet;
        docs.push(
          makeDoc({
            source: "youtube",
            channel: "discussion",
            nativeId: th.id,
            regionHint: regionId,
            query: meta.q,
            url: `https://www.youtube.com/watch?v=${videoId}&lc=${th.id}`,
            title: `Comment on: ${meta.title}`,
            text: c.textOriginal || c.textDisplay,
            createdAt: c.publishedAt,
            score: c.likeCount,
            comments: th.snippet.totalReplyCount,
          }),
        );
      }
    } catch (err) {
      // comments disabled on many videos - not fatal
      if (!/commentsDisabled/.test(err.message)) log(`youtube comments ${videoId} failed: ${err.message}`);
    }
  }
  return docs;
}
