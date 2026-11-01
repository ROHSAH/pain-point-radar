// Generates SYNTHETIC sample data for `npm run demo` and the tests.
// These are invented examples (urls point at example.com) - not research findings.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url));

const rows = [
  // id, source, channel, region, score, comments, category, sub_issue, severity, quote
  ["reddit:t3_a1", "reddit", "discussion", "india", 420, 88, "payout_pricing", "kabadiwala underweighs scrap", 3, "the kabadiwala's scale always shows 20% less"],
  ["reddit:t3_a2", "reddit", "discussion", "india", 35, 12, "trust_greenwashing", "segregated waste mixed in truck", 4, "we segregate and the BBMP truck dumps it all together"],
  ["x:1", "x", "social", "india", 12, 3, "trust_greenwashing", "segregated waste mixed in truck", 4, "what's the point of segregating if the van mixes it"],
  ["google_suggest:in:where to dispose e waste", "google_suggest", "search", "india", 9, 0, "access_drop_off", "nowhere to drop e-waste", 2, ""],
  ["youtube:c1", "youtube", "discussion", "india", 3, 0, "collection_reliability", "dry waste not collected", 3, "dry waste pickup hasn't come in two weeks"],
  ["reddit:t3_e1", "reddit", "discussion", "europe", 900, 210, "collection_reliability", "bin collection missed for weeks", 4, "council hasn't emptied our recycling in 5 weeks"],
  ["reddit:t1_e2", "reddit", "discussion", "europe", 150, 4, "booking_digital", "recycling centre booking slots full", 3, "you now have to book the tip a week in advance"],
  ["web:https://example.com/r/1", "web", "review", "europe", 0, 0, "deposit_return", "reverse vending machine broken", 2, "Pfand machine out of order again"],
  ["google_suggest:gb:can you recycle soft plastics", "google_suggest", "search", "europe", 8, 0, "sorting_confusion", "unclear if soft plastics recyclable", 1, ""],
  ["reddit:t3_u1", "reddit", "discussion", "us", 2300, 640, "trust_greenwashing", "recycling ends up in landfill", 3, "most of it just goes to landfill anyway"],
  ["reddit:t3_u2", "reddit", "discussion", "us", 75, 30, "access_drop_off", "apartment has no recycling", 3, "my complex only has trash dumpsters"],
  ["x:2", "x", "social", "us", 40, 9, "collection_reliability", "hauler skipped recycling pickup", 3, "Waste Management skipped our recycling again"],
  ["google_suggest:us:why is recycling so confusing", "google_suggest", "search", "us", 10, 0, "sorting_confusion", "recycling rules differ by city", 1, ""],
  ["reddit:t3_n1", "reddit", "discussion", "us", 5, 1, null, null, 0, ""],
];

const docs = [], classified = [];
for (const [id, source, channel, region, score, comments, category, sub, sev, quote] of rows) {
  const text = source === "google_suggest" ? id.split(":").slice(2).join(":") : quote || "unrelated post about a recycled guitar riff";
  docs.push({ id, source, channel, region_hint: region, query: "sample", url: `https://example.com/${encodeURIComponent(id)}`, title: "", text, created_at: "2026-09-01T00:00:00Z", engagement: { score, comments }, lang: "en", collected_at: "2026-10-31T00:00:00Z" });
  classified.push({ id, relevant: !!category, region, country: "", pain_points: category ? [{ category, sub_issue: sub, severity: sev, quote }] : [], model: "fixture", classified_at: "2026-10-31T00:00:00Z" });
}
fs.writeFileSync(path.join(dir, "docs.jsonl"), docs.map((d) => JSON.stringify(d)).join("\n") + "\n");
fs.writeFileSync(path.join(dir, "classified.jsonl"), classified.map((d) => JSON.stringify(d)).join("\n") + "\n");
console.log(`wrote ${docs.length} synthetic docs`);
