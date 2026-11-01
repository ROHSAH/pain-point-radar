import path from "node:path";
import { z } from "zod";
import { structuredCall, MODEL } from "./llm.js";
import { appendJsonl, readJsonl, mapLimit, log } from "./util.js";

export const REGIONS = ["india", "europe", "us", "other"];

const PainPoint = z.object({
  category: z.string().describe("One taxonomy category id"),
  sub_issue: z.string().describe("Specific problem in 3-8 English words, e.g. 'kabadiwala underweighs scrap'"),
  severity: z.number().describe("1 = mild annoyance ... 5 = severe / repeated / health or money impact"),
  quote: z.string().describe("Short verbatim excerpt (<= 200 chars) showing the pain point, original language"),
});

const Result = z.object({
  id: z.string(),
  relevant: z.boolean().describe("true only if the text is a customer/citizen talking about a recycling or waste-handling experience, need or problem"),
  region: z.string().describe("india | europe | us | other"),
  country: z.string().describe("Country name if identifiable, else empty string"),
  persona: z.string().describe("One persona id from the persona list"),
  pain_points: z.array(PainPoint),
});

const BatchSchema = z.object({ results: z.array(Result) });

export function buildSystemPrompt(taxonomy) {
  const cats = taxonomy.categories.map((c) => `- ${c.id}: ${c.name} - ${c.description}`).join("\n");
  const personas = taxonomy.personas.map((c) => `- ${c.id}: ${c.name} - ${c.description}`).join("\n");
  return `You are a market-research analyst studying customer pain points in the recycling and waste-collection business (households, apartment societies, small businesses, people selling scrap) in India, Europe and the United States.

You receive a JSON array of public documents: Reddit posts/comments, X posts, YouTube comments, review/complaint-site snippets, and Google autocomplete search queries. For EVERY document return one result with the same id.

Rules:
- relevant=true only when the author (or searcher) is a customer/citizen expressing an experience, need, frustration or question about recycling, scrap selling, waste segregation/collection, or disposal of recyclable items. News headlines, ads, company PR, jokes with no substance, and unrelated uses of words like "bin" or "recycle" are relevant=false with no pain_points.
- Search queries (source google_suggest) are one-liners typed by many people. Count one as a pain point only when it implies difficulty, confusion, distrust, cost or an unmet need (e.g. "where to recycle batteries" -> access_drop_off, "can you recycle pizza boxes" -> sorting_confusion, "why is recycling a waste of time" -> trust_greenwashing). Product-shopping queries ("recycling bin with lid") are not pain points.
- A document may contain 0-3 distinct pain points; list each once. Do not invent pain points that are not in the text.
- category must be exactly one of the ids below; use "other" only when nothing fits.
- sub_issue: a concise, reusable English phrase naming the specific problem (not the whole story), so identical problems from different people get near-identical phrases.
- region: india, europe (UK, EU, EEA, Switzerland), us, or other. Use evidence in the text (cities, councils, currency, brands like BBMP / Waste Management / Pfand); if there is none, use region_hint unless region_hint is "global", in which case use "other".
- persona: who is speaking, from the persona ids below, inferred from what they say about their housing, role or motivation ("our society", "my landlord", "I run a cafe", "the kabadiwala paid me", "I'm a binman"). Use general_citizen when it cannot be inferred - do not guess.
- Write in English except quote, which stays verbatim in the original language.

Pain-point categories:
${cats}

Personas:
${personas}`;
}

export function normalizeResult(r, doc, taxonomy) {
  const ids = new Set(taxonomy.categories.map((c) => c.id));
  const personaIds = new Set(taxonomy.personas.map((c) => c.id));
  const persona = personaIds.has(r.persona) ? r.persona : "general_citizen";
  let region = String(r.region || "").toLowerCase().trim();
  if (region === "uk" || region === "eu") region = "europe";
  if (region === "usa" || region === "united states") region = "us";
  if (!REGIONS.includes(region)) region = REGIONS.includes(doc.region_hint) ? doc.region_hint : "other";
  const pain_points = (r.relevant ? r.pain_points : [])
    .slice(0, 3)
    .map((p) => ({
      category: ids.has(p.category) ? p.category : "other",
      sub_issue: String(p.sub_issue || "").trim().toLowerCase().slice(0, 80) || "unspecified",
      severity: Math.min(5, Math.max(1, Math.round(Number(p.severity) || 1))),
      quote: String(p.quote || "").slice(0, 240),
    }));
  return { id: doc.id, relevant: Boolean(r.relevant), region, country: r.country || "", persona, pain_points, model: MODEL, classified_at: new Date().toISOString() };
}

export async function classify({ docs, dataDir, taxonomy, batchSize = 20, concurrency = 4, maxDocChars = 1500, maxDocs = Infinity }) {
  const file = path.join(dataDir, "classified.jsonl");
  // Rows labelled by the keyword classifier are re-done by Claude (the newer row wins downstream).
  const done = new Set(readJsonl(file).filter((r) => r.model !== "rules").map((r) => r.id));
  const todo = docs.filter((d) => !done.has(d.id)).slice(0, maxDocs);
  log(`classify: ${done.size} already classified, ${todo.length} to go (model ${MODEL})`);
  if (!todo.length) return readJsonl(file);

  const system = buildSystemPrompt(taxonomy);
  const batches = [];
  for (let i = 0; i < todo.length; i += batchSize) batches.push(todo.slice(i, i + batchSize));

  let finished = 0;
  await mapLimit(batches, concurrency, async (batch) => {
    const byId = new Map(batch.map((d) => [d.id, d]));
    const payload = batch.map((d) => ({
      id: d.id,
      source: d.source,
      region_hint: d.region_hint,
      title: d.title?.slice(0, 200) || undefined,
      // Long posts are clipped for cost; the opening of a complaint carries the pain point in practice.
      text: d.text.length > maxDocChars ? d.text.slice(0, maxDocChars) + " [...]" : d.text,
    }));
    const out = await structuredCall({
      system,
      user: `Classify these ${batch.length} documents:\n${JSON.stringify(payload)}`,
      schema: BatchSchema,
      effort: "low",
    });
    if (!out) return;
    const rows = [];
    for (const r of out.results) {
      const doc = byId.get(r.id);
      if (!doc) continue;
      rows.push(normalizeResult(r, doc, taxonomy));
      byId.delete(r.id);
    }
    if (byId.size) log(`classify: model skipped ${byId.size} docs in a batch; they will be retried next run`);
    appendJsonl(file, rows); // persisted per batch, so an interrupted run resumes where it stopped
    finished += batch.length;
    log(`classify: ${finished}/${todo.length}`);
  });
  return readJsonl(file);
}
