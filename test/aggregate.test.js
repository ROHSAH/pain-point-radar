import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { aggregate, docWeight } from "../src/aggregate.js";
import { dedupe } from "../src/collect.js";
import { normalizeResult } from "../src/classify.js";
import { renderCsv, renderMarkdown } from "../src/report.js";
import { readJsonl, readJson, makeDoc } from "../src/util.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const taxonomy = readJson(path.join(root, "topics/recycling/taxonomy.json"));
const docs = readJsonl(path.join(root, "test/fixtures/docs.jsonl"));
const classified = readJsonl(path.join(root, "test/fixtures/classified.jsonl"));

test("docWeight dampens engagement logarithmically", () => {
  assert.equal(docWeight({ engagement: { score: 0, comments: 0 } }), 1);
  assert.ok(Math.abs(docWeight({ engagement: { score: 999, comments: 0 } }) - 4) < 1e-9);
});

test("aggregate ranks by weighted volume and splits regions", () => {
  const agg = aggregate({ docs, classified, taxonomy });
  assert.deepEqual(Object.keys(agg).sort(), ["all", "europe", "india", "us"]);
  assert.equal(agg.india.pain_points[0].category, "trust_greenwashing"); // two modest mentions (2.68 + 2.20) outrank one viral post (3.71)
  assert.equal(agg.us.relevant_docs, 4);
  assert.equal(agg.us.total_docs, 5);
  const ranks = agg.all.pain_points.map((p) => p.weighted_volume);
  assert.deepEqual(ranks, [...ranks].sort((a, b) => b - a));
});

test("a document counts once per category", () => {
  const c = [{ id: "reddit:t3_u1", relevant: true, region: "us", pain_points: [
    { category: "trust_greenwashing", sub_issue: "a", severity: 2, quote: "x" },
    { category: "trust_greenwashing", sub_issue: "b", severity: 4, quote: "y" }] }];
  const agg = aggregate({ docs, classified: c, taxonomy });
  assert.equal(agg.us.pain_points[0].mentions, 1);
  assert.equal(agg.us.pain_points[0].avg_severity, 3);
});

test("themes map sub-issues together", () => {
  const themes = { collection_reliability: { map: { "bin collection missed for weeks": "Missed pickups", "hauler skipped recycling pickup": "Missed pickups", "dry waste not collected": "Missed pickups" } } };
  const agg = aggregate({ docs, classified, themes, taxonomy });
  const p = agg.all.pain_points.find((x) => x.category === "collection_reliability");
  assert.equal(p.themes[0].theme, "Missed pickups");
  assert.equal(p.themes[0].mentions, 3);
});

test("dedupe drops repeated ids and copy-pasted text", () => {
  const a = makeDoc({ source: "x", nativeId: "1", regionHint: "us", query: "q", url: "u", text: "Recycling was missed AGAIN!!", channel: "social" });
  const b = makeDoc({ source: "x", nativeId: "2", regionHint: "us", query: "q", url: "u", text: "recycling was missed again", channel: "social" });
  const c = makeDoc({ source: "x", nativeId: "1", regionHint: "us", query: "q", url: "u", text: "different", channel: "social" });
  assert.equal(dedupe([a, b, c]).length, 1);
});

test("normalizeResult clamps fields and falls back to region hint", () => {
  const doc = { id: "d", region_hint: "india" };
  const r = normalizeResult({ id: "d", relevant: true, region: "unknown", country: "", pain_points: [{ category: "made_up", sub_issue: " Kabadiwala Cheats ", severity: 9, quote: "q" }] }, doc, taxonomy);
  assert.equal(r.region, "india");
  assert.equal(r.pain_points[0].category, "other");
  assert.equal(r.pain_points[0].severity, 5);
  assert.equal(r.pain_points[0].sub_issue, "kabadiwala cheats");
  const irrelevant = normalizeResult({ id: "d", relevant: false, region: "uk", pain_points: [{ category: "fees_cost", sub_issue: "x", severity: 1, quote: "" }] }, doc, taxonomy);
  assert.equal(irrelevant.region, "europe");
  assert.equal(irrelevant.pain_points.length, 0);
});

test("reports render", () => {
  const agg = aggregate({ docs, classified, taxonomy });
  const md = renderMarkdown(agg);
  assert.match(md, /## India - top/);
  const csv = renderCsv(agg).trim().split("\n");
  assert.equal(csv[0].split(",")[0], "region");
  assert.ok(csv.length > 5);
});

test("pain points and personas are scoped to the document's region", async () => {
  const { makeKeywordClassifier } = await import("../src/keywordClassifier.js");
  const { buildTaxonomy } = await import("../src/newTopic.js");
  const taxonomy = buildTaxonomy({
    india: { categories: [{ id: "mudra", name: "Mudra hurdles", keywords: ["loan.*(rejected|delay)"] }], personas: [{ id: "kirana", name: "Kirana", keywords: ["shop"] }] },
    us: { categories: [{ id: "sba", name: "SBA delays", keywords: ["loan.*(rejected|delay)"] }], personas: [{ id: "llc", name: "LLC owner", keywords: ["shop"] }] },
  });
  assert.deepEqual(taxonomy.categories.map((c) => c.id), ["in_mudra", "us_sba", "other"]);
  const classify = makeKeywordClassifier({ context_keywords: ["loan"], regions: { india: {}, us: {} }, taxonomy });
  const text = "my shop loan rejected again";
  const inRow = classify({ id: "a", source: "reddit", region_hint: "india", text });
  const usRow = classify({ id: "b", source: "reddit", region_hint: "us", text });
  assert.deepEqual(inRow.pain_points.map((p) => p.category), ["in_mudra"]);
  assert.equal(inRow.persona, "in_kirana");
  assert.deepEqual(usRow.pain_points.map((p) => p.category), ["us_sba"]);
  assert.equal(usRow.persona, "us_llc");
});

test("generic keyword classifier works from a topic's own config", async () => {
  const { makeKeywordClassifier } = await import("../src/keywordClassifier.js");
  const topic = {
    context_keywords: ["charg", "\\bev\\b"],
    regions: { india: {}, us: {} },
    taxonomy: {
      categories: [{ id: "broken", name: "Broken chargers", keywords: ["not working|broken"] }, { id: "price_cost", name: "Price", keywords: ["\\bcost\\b|expensive"] }],
      personas: [{ id: "fleet", name: "Fleet", keywords: ["\\bfleet\\b"] }],
    },
  };
  const classify = makeKeywordClassifier(topic);
  const r = classify({ id: "x", source: "reddit", region_hint: "us", text: "EV charger not working again and so expensive for our fleet" });
  assert.equal(r.relevant, true);
  assert.deepEqual(r.pain_points.map((p) => p.category), ["broken", "price_cost"]);
  assert.equal(r.persona, "fleet");
  assert.equal(r.pain_points[0].severity, 4);
  assert.equal(classify({ id: "y", source: "reddit", region_hint: "us", text: "pizza is expensive" }).relevant, false);
});

test("dashboard embeds a topic dropdown and per-topic rows", async () => {
  const { renderDashboard } = await import("../src/dashboard.js");
  const { buildMentions } = await import("../src/aggregate.js");
  const mentions = buildMentions({ docs, classified, taxonomy });
  const html = renderDashboard({ topics: [{ label: "Recycling", taxonomy, docs, mentions }, { label: "EV charging", taxonomy, docs, mentions }] });
  assert.match(html, /id="f-topic"/);
  const data = JSON.parse(html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(data.topics.map((t) => t.label), ["Recycling", "EV charging"]);
  assert.equal(data.rows.filter((r) => r.tp === "EV charging").length, mentions.length);
});

test("product categories need a problem signal ('require')", async () => {
  const { makeKeywordClassifier } = await import("../src/keywordClassifier.js");
  const classify = makeKeywordClassifier({
    context_keywords: ["merchant cash advance"],
    regions: { us: {} },
    taxonomy: { categories: [{ id: "mca", name: "MCA", keywords: ["merchant cash advance"], require: ["fees?|illegal|trap"] }], personas: [] },
  });
  const doc = (text) => ({ id: "x", source: "google_suggest", region_hint: "us", text });
  assert.equal(classify(doc("merchant cash advance")).relevant, false);
  assert.equal(classify(doc("is merchant cash advance illegal")).pain_points[0].category, "mca");
});

test("reddit-via-search queries target the region's subreddits", async () => {
  const { redditSearchQueries } = await import("../src/sources/webSearch.js");
  const qs = redditSearchQueries({ subreddits: ["IndianStartups", "CAIndia", "india", "x"], queries: ["msme loan rejected", "mudra loan problem", "z"] });
  assert.equal(qs.length, 6);
  assert.equal(qs[0], "msme loan rejected site:reddit.com/r/IndianStartups");
});

test("Brave budget enforces caps and skips repeats", async () => {
  const { createBudget, BudgetExhausted } = await import("../src/sources/braveBudget.js");
  const os = await import("node:os");
  const b = createBudget({ perRun: 2, monthly: 1e9, file: path.join(os.tmpdir(), `brave-budget-test-${process.pid}.json`) });
  b.reserve(); b.reserve();
  assert.throws(() => b.reserve(), BudgetExhausted);
  b.done("test|unit-check|0");
  assert.equal(b.seenRecently("test|unit-check|0"), true);
});
