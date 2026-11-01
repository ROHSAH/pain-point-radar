import path from "node:path";
import { collectReddit } from "./sources/reddit.js";
import { collectX } from "./sources/x.js";
import { collectYouTube } from "./sources/youtube.js";
import { collectGoogleSuggest } from "./sources/googleSuggest.js";
import { collectWebSearch } from "./sources/webSearch.js";
import { appendJsonl, readJsonl, textFingerprint, log } from "./util.js";

export const SOURCES = {
  reddit: collectReddit,
  x: collectX,
  youtube: collectYouTube,
  suggest: collectGoogleSuggest,
  web: collectWebSearch,
};

/** Drop docs we already have (same id) or that duplicate existing text (cross-posts, copy-pasted tweets). */
export function dedupe(newDocs, existing = []) {
  const ids = new Set(existing.map((d) => d.id));
  const prints = new Set(existing.filter((d) => d.source !== "google_suggest").map((d) => textFingerprint(d.text)));
  const out = [];
  for (const d of newDocs) {
    if (ids.has(d.id)) continue;
    if (!d.text || d.text.length < 3) continue;
    // Autocomplete strings are short and legitimately repeat across regions; dedupe them by id only.
    if (d.source !== "google_suggest") {
      const fp = textFingerprint(d.text);
      if (prints.has(fp)) continue;
      prints.add(fp);
    }
    ids.add(d.id);
    out.push(d);
  }
  return out;
}

export async function collect({ regions, sources, dataDir, regionConfig, opts }) {
  const file = path.join(dataDir, "docs.jsonl");
  const existing = readJsonl(file);
  let added = 0;
  for (const regionId of regions) {
    const region = regionConfig[regionId];
    if (!region) throw new Error(`Unknown region "${regionId}" (see config/regions.json)`);
    for (const src of sources) {
      const fn = SOURCES[src];
      if (!fn) throw new Error(`Unknown source "${src}". Options: ${Object.keys(SOURCES).join(", ")}`);
      log(`collect: ${src} / ${regionId} ...`);
      let docs = [];
      try {
        docs = await fn(region, regionId, opts);
      } catch (err) {
        log(`collect: ${src} / ${regionId} failed: ${err.message}`);
      }
      if (opts.sinceDays) {
        const cutoff = Date.now() - opts.sinceDays * 86400_000;
        docs = docs.filter((d) => !d.created_at || Date.parse(d.created_at) >= cutoff);
      }
      const fresh = dedupe(docs, existing);
      appendJsonl(file, fresh);
      existing.push(...fresh);
      added += fresh.length;
      log(`collect: ${src} / ${regionId}: ${docs.length} fetched, ${fresh.length} new`);
    }
  }
  log(`collect: ${added} new documents, ${existing.length} total in ${file}`);
  return existing;
}
