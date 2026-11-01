#!/usr/bin/env node
// Pain-Point Radar: finds and ranks customer pain points for any topic (recycling, EV charging,
// food delivery, banking...) across India, Europe and the US.
//   node src/cli.js topics                         list topics in topics/
//   node src/cli.js new-topic <id> --label "..." --description "..."   add a topic
//   node src/cli.js run --topic <id>               collect -> classify -> consolidate -> report
//   node src/cli.js collect|classify|report --topic <id>               one stage
//   node src/cli.js dashboard                      rebuild the combined all-topics dashboard
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { collect, SOURCES } from "./collect.js";
import { classify } from "./classify.js";
import { renderDashboard } from "./dashboard.js";
import { consolidate } from "./consolidate.js";
import { aggregate, buildMentions, latestById } from "./aggregate.js";
import { writeReports } from "./report.js";
import { readJson, readJsonl, appendJsonl, log } from "./util.js";
import { ROOT, listTopics, loadTopic } from "./topic.js";
import { createTopic } from "./newTopic.js";

if (fs.existsSync(path.join(ROOT, ".env"))) process.loadEnvFile(path.join(ROOT, ".env"));

const HELP = `Usage: node src/cli.js <command> [options]

Commands
  topics                       list available topics
  new-topic <id>               create topics/<id>/ (Claude drafts the search plan and categories when
                               an API key is set; otherwise a template you edit)
                               --label "EV charging" --description "Public EV charging for drivers..."
  run | collect | classify | report   pipeline stages for one topic
  dashboard                    rebuild out/dashboard.html across every topic that has data

Options
  --topic          topic id from topics/                 (default: recycling)
  --regions        comma list from the topic's regions.json (default: all in the file)
  --sources        comma list: ${Object.keys(SOURCES).join(",")}  (default: all; sources without keys are skipped)
  --limit          max items per query/source             (default: 100)
  --time           reddit time window: week|month|year|all (default: year)
  --since-days     drop documents older than N days        (default: 365)
  --max-docs       cap documents classified this run (cost control)
  --batch-size     documents per Claude request           (default: 20)
  --concurrency    parallel Claude requests               (default: 4)
  --top            pain points per region in report.md    (default: 10)
  --classifier     auto|claude|rules  (default: auto = Claude when an API key/profile is set, else keyword rules)
  --skip-consolidate  report without the theme-clustering call
`;

const { positionals, values: a } = parseArgs({
  allowPositionals: true,
  options: {
    topic: { type: "string", default: "recycling" },
    label: { type: "string" },
    description: { type: "string" },
    regions: { type: "string" },
    sources: { type: "string", default: Object.keys(SOURCES).join(",") },
    limit: { type: "string", default: "100" },
    time: { type: "string", default: "year" },
    "since-days": { type: "string", default: "365" },
    "max-docs": { type: "string" },
    "batch-size": { type: "string", default: "20" },
    concurrency: { type: "string", default: "4" },
    top: { type: "string", default: "10" },
    "skip-consolidate": { type: "boolean", default: false },
    classifier: { type: "string", default: "auto" },
    help: { type: "boolean", short: "h" },
  },
});

const cmd = positionals[0];
const COMMANDS = ["topics", "new-topic", "run", "collect", "classify", "report", "dashboard"];
if (a.help || !COMMANDS.includes(cmd)) {
  console.log(HELP);
  process.exit(a.help ? 0 : 1);
}

const list = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);
const dataDirFor = (id) => path.join(ROOT, "data", id);
const outDirFor = (id) => path.join(ROOT, "out", id);
const hasClaude = () =>
  Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_PROFILE || fs.existsSync(path.join(process.env.HOME || "", ".config/anthropic")));

async function main() {
  if (cmd === "topics") {
    for (const t of listTopics()) {
      const n = readJsonl(path.join(dataDirFor(t.id), "docs.jsonl")).length;
      console.log(`${t.id.padEnd(22)} ${t.label.padEnd(28)} ${n ? n + " docs collected" : "no data yet"}`);
    }
    return;
  }
  if (cmd === "new-topic") {
    const id = positionals[1];
    if (!id || !/^[a-z0-9-]+$/.test(id)) throw new Error('Give a topic id in lowercase-with-dashes, e.g. new-topic ev-charging --label "EV charging" --description "..."');
    const dir = await createTopic({ id, label: a.label || id.replace(/-/g, " "), description: a.description || "", useClaude: hasClaude() });
    log(`created ${dir} - review regions.json and taxonomy.json, then: node src/cli.js run --topic ${id}`);
    return;
  }
  if (cmd === "dashboard") return buildCombinedDashboard();

  const topic = await loadTopic(a.topic);
  const dataDir = dataDirFor(topic.id);
  const outDir = outDirFor(topic.id);
  const taxonomy = topic.taxonomy;
  let docs = readJsonl(path.join(dataDir, "docs.jsonl"));

  if (cmd === "run" || cmd === "collect") {
    docs = await collect({
      regions: a.regions ? list(a.regions) : Object.keys(topic.regions).filter((k) => !k.startsWith("_")),
      sources: list(a.sources),
      dataDir,
      regionConfig: topic.regions,
      opts: { limit: Number(a.limit), timeWindow: a.time, sinceDays: Number(a["since-days"]) || 0, subredditQuery: topic.subreddit_query },
    });
  }

  let classified = readJsonl(path.join(dataDir, "classified.jsonl"));
  if (cmd === "run" || cmd === "classify") {
    if (!docs.length) throw new Error(`No documents for topic "${topic.id}" - run "collect --topic ${topic.id}" first`);
    const engine = a.classifier === "auto" ? (hasClaude() ? "claude" : "rules") : a.classifier;
    if (engine === "rules") {
      if (a.classifier === "auto") log("classify: no Claude credentials found - using the keyword classifier (set ANTHROPIC_API_KEY for Claude)");
      const file = path.join(dataDir, "classified.jsonl");
      const done = new Set(classified.map((r) => r.id));
      const rows = docs.filter((d) => !done.has(d.id)).map(topic.classifyByRules);
      appendJsonl(file, rows);
      log(`classify (rules): ${rows.length} documents, ${rows.filter((r) => r.relevant).length} with pain points`);
      classified = readJsonl(file);
    } else {
      classified = await classify({
        docs,
        dataDir,
        taxonomy,
        topic,
        batchSize: Number(a["batch-size"]),
        concurrency: Number(a.concurrency),
        maxDocs: a["max-docs"] ? Number(a["max-docs"]) : Infinity,
      });
    }
  }
  classified = latestById(classified);

  if (cmd === "run" || cmd === "report") {
    if (!classified.length) throw new Error(`No classifications for topic "${topic.id}" - run "classify --topic ${topic.id}" first`);
    const onlyRules = classified.every((r) => r.model === "rules");
    // Theme clustering needs Claude; keyword-rule labels are already a fixed vocabulary.
    const themes = a["skip-consolidate"] || onlyRules ? readJson(path.join(dataDir, "themes.json"), {}) : await consolidate({ classified, dataDir });
    const agg = aggregate({ docs, classified, themes, taxonomy });
    const mentions = buildMentions({ docs, classified, themes, taxonomy });
    const files = writeReports(agg, outDir, { top: Number(a.top), mentions, docs, topicLabel: topic.label });
    fs.writeFileSync(path.join(outDir, "dashboard.html"), renderDashboard({ topics: [{ ...topic, mentions, docs }], title: `${topic.label} Pain-Point Radar` }));
    files.push(path.join(outDir, "dashboard.html"));
    log(`report: wrote ${files.join(", ")}`);
    printSummary(agg, Number(a.top));
    await buildCombinedDashboard();
  }
}

/** One dashboard over every topic with data, with a Topic dropdown. */
async function buildCombinedDashboard() {
  const topics = [];
  for (const meta of listTopics()) {
    const dataDir = dataDirFor(meta.id);
    const docs = readJsonl(path.join(dataDir, "docs.jsonl"));
    const classified = latestById(readJsonl(path.join(dataDir, "classified.jsonl")));
    if (!docs.length || !classified.length) continue;
    const topic = await loadTopic(meta.id);
    const themes = readJson(path.join(dataDir, "themes.json"), {});
    topics.push({ ...topic, docs, mentions: buildMentions({ docs, classified, themes, taxonomy: topic.taxonomy }) });
  }
  if (!topics.length) throw new Error("No topic has classified data yet - run a topic first");
  const file = path.join(ROOT, "out", "dashboard.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, renderDashboard({ topics }));
  log(`dashboard: ${file} (${topics.map((t) => t.label).join(", ")})`);
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
