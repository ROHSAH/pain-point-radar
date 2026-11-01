// Clusters the free-text sub_issues inside each category into a handful of named themes,
// so "bin men skipped our street", "recycling not collected for 3 weeks" and "missed pickup again"
// are counted together. This is what turns thousands of mentions into a ranked list.
import path from "node:path";
import { z } from "zod";
import { structuredCall } from "./llm.js";
import { readJson, writeJson, mapLimit, log } from "./util.js";

const ThemeSchema = z.object({
  themes: z.array(
    z.object({
      theme: z.string().describe("Short customer-language name of the pain point, 3-8 words"),
      description: z.string().describe("One sentence describing the problem"),
      members: z.array(z.number()).describe("Indexes of the input phrases that belong to this theme"),
    }),
  ),
});

const SYSTEM = `You consolidate customer pain-point phrases from market research into themes.
You receive numbered phrases (with mention counts) that all belong to one category. Group phrases that describe the same underlying customer problem.
- Produce between 3 and 12 themes; fewer if the phrases are few. Prefer themes a product manager could act on.
- Every index must appear in exactly one theme. Put leftovers in a theme called "Miscellaneous".
- Theme names should be specific and in plain English (e.g. "Chargers broken on arrival", not "Reliability issues").`;

export function collectSubIssues(classified) {
  const byCat = {};
  for (const r of classified) {
    for (const p of r.pain_points) {
      byCat[p.category] ??= new Map();
      byCat[p.category].set(p.sub_issue, (byCat[p.category].get(p.sub_issue) || 0) + 1);
    }
  }
  return byCat;
}

/** @returns {Record<string, {map: Record<string,string>, themes: {theme:string, description:string}[]}>} */
export async function consolidate({ classified, dataDir, maxPhrases = 400, concurrency = 3 }) {
  const file = path.join(dataDir, "themes.json");
  const prev = readJson(file, {});
  const byCat = collectSubIssues(classified);
  const result = {};

  await mapLimit(Object.entries(byCat), concurrency, async ([cat, counts]) => {
    const phrases = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const head = phrases.slice(0, maxPhrases);
    // Reuse the previous clustering when nothing new appeared in this category.
    if (prev[cat] && head.every(([p]) => p in prev[cat].map)) {
      result[cat] = prev[cat];
      return;
    }
    if (head.length < 3) {
      result[cat] = { themes: head.map(([p]) => ({ theme: p, description: "" })), map: Object.fromEntries(head.map(([p]) => [p, p])) };
      return;
    }
    const user = `Category: ${cat}\nPhrases:\n${head.map(([p, n], i) => `${i}. ${p} (${n})`).join("\n")}`;
    const out = await structuredCall({ system: SYSTEM, user, schema: ThemeSchema, effort: "medium" });
    const map = {};
    const themes = [];
    for (const t of out?.themes || []) {
      themes.push({ theme: t.theme, description: t.description });
      for (const i of t.members) if (head[i] && !(head[i][0] in map)) map[head[i][0]] = t.theme;
    }
    // Anything unassigned (or beyond maxPhrases) keeps its own phrase as theme, so no mention is lost.
    for (const [p] of phrases) map[p] ??= out ? "Miscellaneous" : p;
    if (out && Object.values(map).includes("Miscellaneous") && !themes.some((t) => t.theme === "Miscellaneous"))
      themes.push({ theme: "Miscellaneous", description: "Long-tail issues" });
    result[cat] = { themes, map };
    log(`consolidate: ${cat}: ${phrases.length} phrases -> ${themes.length} themes`);
  });

  writeJson(file, result);
  return result;
}
