// Search-intent collector: Google autocomplete suggestions per country/language.
// Autocomplete reflects what many people actually type, so it is a free proxy for *search* demand
// ("why is recycling so confusing", "kabadiwala not coming"...). No key needed.
// Each seed is expanded with question/complaint modifiers to surface problem-oriented queries.
import { httpJson, makeDoc, sleep, log } from "../util.js";

// "pre" words go before the seed ("why ..."), "post" words after it. A trailing space makes Google
// complete the *next word* instead of the current prefix ("not " -> "not collected", not "nottingham").
const MODIFIERS = {
  en: { pre: ["why", "how to", "where to", "can i", "is it worth"], post: ["problem ", "complaint ", "not ", "cost ", "rules "] },
  de: { pre: ["warum", "wie", "wohin mit"], post: ["problem ", "beschwerde ", "nicht "] },
  fr: { pre: ["pourquoi", "comment", "où"], post: ["problème ", "plainte ", "pas "] },
  es: { pre: ["por qué", "cómo", "dónde"], post: ["problema ", "queja ", "no "] },
  it: { pre: ["perché", "come", "dove"], post: ["problema ", "reclamo ", "non "] },
  nl: { pre: ["waarom", "hoe", "waar"], post: ["probleem ", "klacht ", "niet "] },
};

async function suggest(q, gl, hl) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${hl}&gl=${gl}&q=${encodeURIComponent(q)}`;
  const res = await httpJson(url, { label: "suggest" });
  await sleep(400);
  return Array.isArray(res?.[1]) ? res[1] : [];
}

export async function collectGoogleSuggest(region, regionId) {
  const plans = [];
  if (region.google) plans.push({ ...region.google, seeds: region.suggest_seeds || [] });
  for (const extra of region.google_extra || []) plans.push(extra);

  const docs = [];
  for (const { gl, hl, seeds } of plans) {
    const mods = MODIFIERS[hl] || MODIFIERS.en;
    for (const seed of seeds) {
      const variants = [seed, ...mods.pre.map((m) => `${m} ${seed}`), ...mods.post.map((m) => `${seed} ${m}`)];
      for (const q of variants) {
        let list = [];
        try {
          list = await suggest(q, gl, hl);
        } catch (err) {
          log(`suggest "${q}" failed: ${err.message}`);
          continue;
        }
        list.forEach((s, rank) => {
          docs.push(
            makeDoc({
              source: "google_suggest",
              channel: "search",
              nativeId: `${gl}:${s.toLowerCase()}`,
              regionHint: regionId,
              query: q,
              url: `https://www.google.com/search?q=${encodeURIComponent(s)}&gl=${gl}&hl=${hl}`,
              text: s,
              // Higher-ranked suggestions are more frequently searched; encode as a small engagement signal.
              score: Math.max(0, 10 - rank),
              lang: hl,
            }),
          );
        });
      }
    }
  }
  return docs;
}
