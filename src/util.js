import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const log = (...args) => console.error(new Date().toISOString().slice(11, 19), ...args);

/** fetch with retries on 429/5xx/network errors, honouring Retry-After. */
export async function httpJson(url, { method = "GET", headers = {}, body, retries = 4, label = "" } = {}) {
  let attempt = 0;
  for (;;) {
    let res;
    try {
      res = await fetch(url, {
        method,
        headers: { "User-Agent": process.env.USER_AGENT || "recycling-pain-points-research/0.1", ...headers },
        body,
        signal: AbortSignal.timeout(30_000),
      });
    } catch (err) {
      if (attempt++ >= retries) throw err;
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    if (res.ok) {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(`${label} ${url}: non-JSON response`);
      }
    }
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const ra = Number(res.headers.get("retry-after"));
      const reset = Number(res.headers.get("x-rate-limit-reset")); // X API: epoch seconds
      let wait = 1000 * 2 ** ++attempt;
      if (ra > 0) wait = ra * 1000;
      else if (reset > 0) wait = Math.max(1000, reset * 1000 - Date.now());
      log(`${label} ${res.status}, retrying in ${Math.round(wait / 1000)}s`);
      await sleep(Math.min(wait, 15 * 60_000));
      continue;
    }
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`${label} HTTP ${res.status} for ${url}: ${detail}`);
  }
}

/** Run async fn over items with bounded concurrency. */
export async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

export function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

export function appendJsonl(file, rows) {
  if (!rows.length) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function readJson(file, fallback) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}

/** Normalised fingerprint used to drop cross-posts / copy-paste duplicates. */
export function textFingerprint(text) {
  const norm = String(text || "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .slice(0, 400);
  return crypto.createHash("sha1").update(norm).digest("hex").slice(0, 16);
}

export function stripHtml(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Build a normalised document. All collectors emit this shape. */
export function makeDoc({ source, nativeId, regionHint, query, url, title = "", text = "", createdAt = null, score = 0, comments = 0, lang = null, channel }) {
  return {
    id: `${source}:${nativeId}`,
    source,
    channel, // "search" | "discussion" | "social" | "review"
    region_hint: regionHint,
    query,
    url,
    title: stripHtml(title),
    text: stripHtml(text),
    created_at: createdAt,
    engagement: { score: Math.max(0, Number(score) || 0), comments: Math.max(0, Number(comments) || 0) },
    lang,
    collected_at: new Date().toISOString(),
  };
}
