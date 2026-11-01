// Pure ranking logic (no I/O) - unit-tested in test/aggregate.test.js.
//
// Volume model:
//   mentions          = number of distinct documents that raise the pain point
//   weighted_volume   = sum over those documents of (1 + log10(1 + upvotes/likes + replies))
//                       -> a post 1,000 people upvoted counts ~4x a post nobody reacted to,
//                          not 1,000x, so one viral thread cannot dominate the ranking.
//   share_of_relevant = mentions / relevant documents in that region
// Pain points are ranked by weighted_volume (ties: mentions).

export function docWeight(doc) {
  const e = doc?.engagement || {};
  return 1 + Math.log10(1 + (e.score || 0) + (e.comments || 0));
}

const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

/** Latest classification per document id (a Claude pass overrides an earlier rules pass). */
export function latestById(classified) {
  const m = new Map();
  for (const r of classified) m.set(r.id, r);
  return [...m.values()];
}

/**
 * One row per (document x pain-point category) - the verbatim complaint log behind every number.
 * This is what complaints.csv and the dashboard are built from.
 */
export function buildMentions({ docs, classified, themes = {}, taxonomy }) {
  const docById = new Map(docs.map((d) => [d.id, d]));
  const catName = Object.fromEntries(taxonomy.categories.map((c) => [c.id, c.name]));
  const rows = [];
  for (const r of classified) {
    const doc = docById.get(r.id);
    if (!doc || !r.relevant) continue;
    const seen = new Set();
    for (const p of r.pain_points) {
      if (seen.has(p.category)) continue;
      seen.add(p.category);
      rows.push({
        doc_id: doc.id,
        region: r.region,
        country: r.country || "",
        persona: r.persona || "general_citizen",
        category: p.category,
        category_name: catName[p.category] || p.category,
        theme: themes[p.category]?.map?.[p.sub_issue] ?? p.sub_issue,
        sub_issue: p.sub_issue,
        severity: p.severity,
        source: doc.source,
        channel: doc.channel,
        engagement: (doc.engagement?.score || 0) + (doc.engagement?.comments || 0),
        weight: Math.round(docWeight(doc) * 100) / 100,
        date: doc.created_at ? doc.created_at.slice(0, 10) : "",
        quote: p.quote || "",
        verbatim: doc.text,
        title: doc.title || "",
        url: doc.url,
        query: doc.query,
        classifier: r.model,
      });
    }
  }
  return rows;
}

export function aggregate({ docs, classified, themes = {}, taxonomy, examplesPerPoint = 3, themesPerPoint = 5 }) {
  const docById = new Map(docs.map((d) => [d.id, d]));
  const catName = Object.fromEntries(taxonomy.categories.map((c) => [c.id, c.name]));
  const regions = {};
  const bucket = (region) =>
    (regions[region] ??= { region, total_docs: 0, relevant_docs: 0, by_source: {}, points: new Map() });

  for (const r of classified) {
    const doc = docById.get(r.id);
    if (!doc) continue;
    const w = docWeight(doc);
    for (const region of [r.region, "all"]) {
      const b = bucket(region);
      b.total_docs++;
      b.by_source[doc.source] = (b.by_source[doc.source] || 0) + 1;
      if (!r.relevant) continue;
      b.relevant_docs++;
      const seenCats = new Set();
      for (const p of r.pain_points) {
        const theme = themes[p.category]?.map?.[p.sub_issue] ?? p.sub_issue;
        let pt = b.points.get(p.category);
        if (!pt) {
          pt = { category: p.category, name: catName[p.category] || p.category, mentions: 0, weighted: 0, sevSum: 0, sevN: 0, channels: {}, sources: {}, personas: {}, themes: new Map(), examples: [] };
          b.points.set(p.category, pt);
        }
        // Count each document once per category, even if it lists two sub-issues in that category.
        if (!seenCats.has(p.category)) {
          seenCats.add(p.category);
          pt.mentions++;
          pt.weighted += w;
          pt.channels[doc.channel] = (pt.channels[doc.channel] || 0) + 1;
          pt.sources[doc.source] = (pt.sources[doc.source] || 0) + 1;
          const persona = r.persona || "general_citizen";
          pt.personas[persona] = (pt.personas[persona] || 0) + 1;
        }
        pt.sevSum += p.severity;
        pt.sevN++;
        const th = pt.themes.get(theme) || { theme, mentions: 0, weighted: 0 };
        th.mentions++;
        th.weighted += w;
        pt.themes.set(theme, th);
        if (p.quote && doc.source !== "google_suggest") pt.examples.push({ quote: p.quote, url: doc.url, source: doc.source, weight: w, theme });
        else if (doc.source === "google_suggest") pt.examples.push({ quote: `search: "${doc.text}"`, url: doc.url, source: doc.source, weight: w * 0.5, theme });
      }
    }
  }

  const out = {};
  for (const [region, b] of Object.entries(regions)) {
    const points = [...b.points.values()]
      .map((pt) => ({
        category: pt.category,
        name: pt.name,
        mentions: pt.mentions,
        weighted_volume: round(pt.weighted),
        share_of_relevant: b.relevant_docs ? round(pt.mentions / b.relevant_docs, 3) : 0,
        avg_severity: pt.sevN ? round(pt.sevSum / pt.sevN, 1) : 0,
        channels: pt.channels,
        sources: pt.sources,
        personas: pt.personas,
        themes: [...pt.themes.values()]
          .sort((a, c) => c.weighted - a.weighted || c.mentions - a.mentions)
          .slice(0, themesPerPoint)
          .map((t) => ({ theme: t.theme, mentions: t.mentions, weighted_volume: round(t.weighted) })),
        examples: pickExamples(pt.examples, examplesPerPoint),
      }))
      .sort((a, c) => c.weighted_volume - a.weighted_volume || c.mentions - a.mentions)
      .map((p, i) => ({ rank: i + 1, ...p }));
    out[region] = { region, total_docs: b.total_docs, relevant_docs: b.relevant_docs, by_source: b.by_source, pain_points: points };
  }
  return out;
}

/** Highest-engagement quotes, preferring variety across themes and sources. */
function pickExamples(examples, n) {
  const sorted = [...examples].sort((a, b) => b.weight - a.weight);
  const picked = [];
  const seen = new Set();
  for (const e of sorted) {
    const key = `${e.theme}|${e.source}`;
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(e);
    if (picked.length >= n) break;
  }
  for (const e of sorted) {
    if (picked.length >= n) break;
    if (!picked.includes(e)) picked.push(e);
  }
  return picked.map(({ quote, url, source, theme }) => ({ quote, url, source, theme }));
}
