import fs from "node:fs";
import path from "node:path";
import { writeJson } from "./util.js";

const REGION_LABEL = { india: "India", europe: "Europe (UK + EU)", us: "United States", other: "Other / unattributed", all: "All regions combined" };
const ORDER = ["all", "india", "europe", "us", "other"];

const csvCell = (v) => {
  const s = typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const md = (s) => String(s).replace(/\|/g, "\\|").replace(/\n+/g, " ");
const fmtMix = (obj) =>
  Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");

export function renderMarkdown(agg, { top = 10, generatedAt = new Date().toISOString() } = {}) {
  const lines = [];
  lines.push(`# Recycling customer pain points - India, Europe, US`, "");
  lines.push(`_Generated ${generatedAt.slice(0, 16).replace("T", " ")} UTC_`, "");
  lines.push("## Coverage", "", "| Region | Documents classified | Relevant | Sources |", "|---|---:|---:|---|");
  for (const r of ORDER) if (agg[r]) lines.push(`| ${REGION_LABEL[r]} | ${agg[r].total_docs} | ${agg[r].relevant_docs} | ${fmtMix(agg[r].by_source)} |`);
  lines.push("");

  for (const r of ORDER) {
    const reg = agg[r];
    if (!reg || !reg.pain_points.length) continue;
    lines.push(`## ${REGION_LABEL[r]} - top ${Math.min(top, reg.pain_points.length)} pain points`, "");
    lines.push("| # | Pain point | Mentions | Weighted volume | % of relevant | Avg severity | Channel mix | Top themes |", "|---:|---|---:|---:|---:|---:|---|---|");
    for (const p of reg.pain_points.slice(0, top)) {
      const themes = p.themes.slice(0, 3).map((t) => `${md(t.theme)} (${t.mentions})`).join("; ");
      lines.push(`| ${p.rank} | **${md(p.name)}** | ${p.mentions} | ${p.weighted_volume} | ${(p.share_of_relevant * 100).toFixed(1)}% | ${p.avg_severity} | ${fmtMix(p.channels)} | ${themes} |`);
    }
    lines.push("");
    if (r === "all") continue; // examples are shown per region
    lines.push("<details><summary>Voice of customer - example quotes</summary>", "");
    for (const p of reg.pain_points.slice(0, top)) {
      lines.push(`**${p.rank}. ${p.name}**`, "");
      for (const e of p.examples) lines.push(`- "${md(e.quote)}" - [${e.source}](${e.url})`);
      lines.push("");
    }
    lines.push("</details>", "");
  }

  lines.push(
    "## How to read this",
    "",
    "- **Mentions** = distinct posts, comments, reviews or search queries raising the pain point. **Weighted volume** adds engagement: each mention counts `1 + log10(1 + upvotes/likes + replies)`, so widely-agreed complaints rank higher without one viral thread dominating.",
    "- **Channel mix**: `search` = Google autocomplete (what people type), `discussion` = Reddit/YouTube/forums, `social` = X, `review` = complaint & review sites. A pain point strong in `search` but weak in `discussion` is an information gap; the reverse is a service failure people vent about.",
    "- Volumes are **in-sample**: they reflect the queries in `config/regions.json` and each platform's API limits (X recent search covers 7 days). Compare pain points *within* a region; compare regions by **% of relevant**, not raw counts.",
    "",
  );
  return lines.join("\n");
}

export function renderCsv(agg) {
  const header = ["region", "rank", "category", "pain_point", "mentions", "weighted_volume", "share_of_relevant", "avg_severity", "channels", "sources", "personas", "top_themes", "example_quote", "example_url"];
  const rows = [header.join(",")];
  for (const r of ORDER) {
    for (const p of agg[r]?.pain_points || []) {
      rows.push(
        [r, p.rank, p.category, p.name, p.mentions, p.weighted_volume, p.share_of_relevant, p.avg_severity, p.channels, p.sources, p.personas, p.themes.map((t) => `${t.theme} (${t.mentions})`).join("; "), p.examples[0]?.quote, p.examples[0]?.url]
          .map(csvCell)
          .join(","),
      );
    }
  }
  return rows.join("\n") + "\n";
}

export function toCsv(rows, columns) {
  return [columns.join(","), ...rows.map((r) => columns.map((c) => csvCell(r[c])).join(","))].join("\n") + "\n";
}

export const MENTION_COLUMNS = ["region", "country", "persona", "category_name", "theme", "sub_issue", "severity", "source", "channel", "engagement", "date", "quote", "verbatim", "url", "classifier"];

export function writeReports(agg, outDir, opts) {
  fs.mkdirSync(outDir, { recursive: true });
  if (opts.mentions) fs.writeFileSync(path.join(outDir, "complaints.csv"), toCsv(opts.mentions, MENTION_COLUMNS));
  if (opts.docs) fs.writeFileSync(path.join(outDir, "documents.csv"), toCsv(opts.docs.map((d) => ({ ...d, score: d.engagement?.score, comments: d.engagement?.comments })), ["id", "source", "channel", "region_hint", "query", "created_at", "score", "comments", "title", "text", "url"]));
  writeJson(path.join(outDir, "pain_points.json"), agg);
  fs.writeFileSync(path.join(outDir, "pain_points.csv"), renderCsv(agg));
  fs.writeFileSync(path.join(outDir, "report.md"), renderMarkdown(agg, opts));
  return ["report.md", "pain_points.csv", "pain_points.json", ...(opts.mentions ? ["complaints.csv"] : []), ...(opts.docs ? ["documents.csv"] : [])].map((f) => path.join(outDir, f));
}
