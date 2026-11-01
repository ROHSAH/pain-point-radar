// Generic keyword classifier - the no-API-key fallback for any topic.
// It reads regexes from the topic's own files, so a new topic needs no code:
//   topic.json     "context_keywords": text must match one of these to count as on-topic
//                  "irrelevant_keywords": text matching these is dropped (shopping, homework, jobs...)
//   taxonomy.json  categories[].keywords and personas[].keywords
// Literal and transparent, but much less precise than Claude. Rows carry model: "rules".

const DEFAULT_IRRELEVANT = ["\\b(notes?|pdf|ppt|essay|assignment|meaning|definition|wikipedia|jobs?|salary|careers?|share price|stock price|lyrics|movie|meme|logo|png|clipart)\\b"];
const SEVERE = /again|weeks|months|never|worst|ridiculous|joke|useless|scam|furious|disgust|fed up|refund|cheat|fraud|dangerous|unsafe/i;

const compile = (list) => (list && list.length ? new RegExp(list.join("|"), "i") : null);

export function makeKeywordClassifier(topic) {
  const context = compile(topic.context_keywords);
  const irrelevant = compile([...DEFAULT_IRRELEVANT, ...(topic.irrelevant_keywords || [])]);
  const cats = (topic.taxonomy.categories || []).filter((c) => c.keywords?.length).map((c) => ({ id: c.id, label: c.name.toLowerCase(), re: compile(c.keywords) }));
  const personas = (topic.taxonomy.personas || []).filter((p) => p.keywords?.length).map((p) => ({ id: p.id, re: compile(p.keywords) }));
  const regionIds = Object.keys(topic.regions || {}).filter((r) => r !== "global");

  return function classifyByRules(doc) {
    const text = `${doc.title || ""} ${doc.text || ""}`.replace(/\s+/g, " ").trim();
    const region = regionIds.includes(doc.region_hint) ? doc.region_hint : "other";
    const persona = (personas.find((p) => p.re.test(text)) || { id: "general_citizen" }).id;
    const base = { id: doc.id, country: "", region, persona, model: "rules", classified_at: new Date().toISOString() };
    if ((irrelevant && irrelevant.test(text)) || (context && !context.test(text))) return { ...base, relevant: false, pain_points: [] };

    const pain_points = [];
    for (const c of cats) {
      if (pain_points.length >= 3) break;
      if (!c.re.test(text)) continue;
      let severity = doc.source === "google_suggest" ? 1 : 2;
      if (SEVERE.test(text)) severity += 2;
      pain_points.push({ category: c.id, sub_issue: c.label, severity: Math.min(5, severity), quote: doc.source === "google_suggest" ? "" : text.slice(0, 240) });
    }
    return { ...base, relevant: pain_points.length > 0, pain_points };
  };
}
