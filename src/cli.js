#!/usr/bin/env node
// Recycling pain-point agent.
//   node src/cli.js run       collect -> classify -> consolidate -> report
//   node src/cli.js collect   only fetch new documents into data/docs.jsonl
//   node src/cli.js classify  only classify not-yet-classified documents
//   node src/cli.js report    consolidate themes + write out/report.md, .csv, .json
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { collect, SOURCES } from "./collect.js";
import { classify } from "./classify.js";
import { classifyByRules } from "./ruleClassifier.js";
import { renderDashboard } from "./dashboard.js";
import { consolidate } from "./consolidate.js";
import { aggregate, buildMentions, latestById } from "./aggregate.js";
import { writeReports } from "./report.js";
import { readJson, readJsonl, appendJsonl, log } from "./util.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (fs.existsSync(path.join(ROOT, ".env"))) process.loadEnvFile(path.join(ROOT, ".env"));

const HELP = `Usage: node src/cli.js <run|collect|classify|report> [options]

  --regions        comma list from config/regions.json   (default: india,europe,us,global)
  --sources        comma list: ${Object.keys(SOURCES).join(",")}  (default: all; sources without keys are skipped)
  --limit          max items per query/source             (default: 100)
  --time           reddit time window: week|month|year|all (default: year)
  --since-days     drop documents older than N days        (default: 365)
  --max-docs       cap documents classified this run (cost control)
  --batch-size     documents per Claude request           (default: 20)
  --concurrency    parallel Claude requests               (default: 4)
  --top            pain points per region in report.md    (default: 10)
  --classifier     auto|claude|rules  (default: auto = Claude when an API key/profile is set, else keyword rules)
  --data-dir       (default: ./data)    --out-dir (default: ./out)
  --skip-consolidate  report without the theme-clustering call
`;

const { positionals, values: a } = parseArgs({
  allowPositionals: true,
  options: {
    regions: { type: "string", default: "india,europe,us,global" },
    sources: { type: "string", default: Object.keys(SOURCES).join(",") },
    limit: { type: "string", default: "100" },
    time: { type: "string", default: "year" },
    "since-days": { type: "string", default: "365" },
    "max-docs": { type: "string" },
    "batch-size": { type: "string", default: "20" },
    concurrency: { type: "string", default: "4" },
    top: { type: "string", default: "10" },
    "data-dir": { type: "string", default: path.join(ROOT, "data") },
    "out-dir": { type: "string", default: path.join(ROOT, "out") },
    "skip-consolidate": { type: "boolean", default: false },
    classifier: { type: "string", default: "auto" },
    help: { type: "boolean", short: "h" },
  },
});

const cmd = positionals[0];
if (a.help || !["run", "collect", "classify", "report"].includes(cmd)) {
  console.log(HELP);
  process.exit(a.help ? 0 : 1);
}

const regionConfig = readJson(path.join(ROOT, "config/regions.json"));
const taxonomy = readJson(path.join(ROOT, "config/taxonomy.json"));
const dataDir = path.resolve(a["data-dir"]);
const outDir = path.resolve(a["out-dir"]);
const list = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

async function main() {
  let docs = readJsonl(path.join(dataDir, "docs.jsonl"));

  if (cmd === "run" || cmd === "collect") {
    docs = await collect({
      regions: list(a.regions),
      sources: list(a.sources),
      dataDir,
      regionConfig,
      opts: { limit: Number(a.limit), timeWindow: a.time, sinceDays: Number(a["since-days"]) || 0 },
    });
  }

  let classified = readJsonl(path.join(dataDir, "classified.jsonl"));
  if (cmd === "run" || cmd === "classify") {
    if (!docs.length) throw new Error(`No documents in ${dataDir}/docs.jsonl - run "collect" first`);
    const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_PROFILE || fs.existsSync(path.join(process.env.HOME || "", ".config/anthropic")));
    const engine = a.classifier === "auto" ? (hasClaude ? "claude" : "rules") : a.classifier;
    if (engine === "rules") {
      if (a.classifier === "auto") log("classify: no Claude credentials found - using the keyword classifier (set ANTHROPIC_API_KEY for Claude)");
      const file = path.join(dataDir, "classified.jsonl");
      const done = new Set(classified.map((r) => r.id));
      const rows = docs.filter((d) => !done.has(d.id)).map(classifyByRules);
      appendJsonl(file, rows);
      log(`classify (rules): ${rows.length} documents, ${rows.filter((r) => r.relevant).length} with pain points`);
      classified = readJsonl(file);
    } else {
      classified = await classify({
        docs,
        dataDir,
        taxonomy,
        batchSize: Number(a["batch-size"]),
        concurrency: Number(a.concurrency),
        maxDocs: a["max-docs"] ? Number(a["max-docs"]) : Infinity,
      });
    }
  }
  classified = latestById(classified);

  if (cmd === "run" || cmd === "report") {
    if (!classified.length) throw new Error(`No classifications in ${dataDir}/classified.jsonl - run "classify" first`);
    const onlyRules = classified.every((r) => r.model === "rules");
    // Theme clustering needs Claude; keyword-rule labels are already a fixed vocabulary.
    const themes = a["skip-consolidate"] || onlyRules ? readJson(path.join(dataDir, "themes.json"), {}) : await consolidate({ classified, dataDir });
    const agg = aggregate({ docs, classified, themes, taxonomy });
    const mentions = buildMentions({ docs, classified, themes, taxonomy });
    const files = writeReports(agg, outDir, { top: Number(a.top), mentions, docs });
    fs.writeFileSync(path.join(outDir, "dashboard.html"), renderDashboard({ mentions, docs, taxonomy }));
    files.push(path.join(outDir, "dashboard.html"));
    log(`report: wrote ${files.join(", ")}`);
    printSummary(agg, Number(a.top));
  }
}

function printSummary(agg, top) {
  for (const r of ["india", "europe", "us"]) {
    if (!agg[r]) continue;
    console.log(`\n${r.toUpperCase()}  (${agg[r].relevant_docs} relevant of ${agg[r].total_docs})`);
    for (const p of agg[r].pain_points.slice(0, top))
      console.log(`  ${String(p.rank).padStart(2)}. ${p.name.padEnd(42)} ${String(p.mentions).padStart(5)} mentions  wv ${p.weighted_volume}  - ${p.themes[0]?.theme ?? ""}`);
  }
}

main().catch((err) => {
  log(`error: ${err.message}`);
  process.exit(1);
});
