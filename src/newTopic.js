// Creates topics/<id>/ for a new industry or subject.
// With Claude: drafts the whole search plan, categories and personas for that topic.
// Without Claude: writes a working template with industry-agnostic categories you can refine.
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { TOPICS_DIR } from "./topic.js";
import { structuredCall } from "./llm.js";
import { writeJson } from "./util.js";

const LOCALES = {
  india: { label: "India", google: { gl: "in", hl: "en" }, youtube: { regionCode: "IN" }, brave: { country: "IN" } },
  europe: { label: "Europe (UK + EU)", google: { gl: "gb", hl: "en" }, youtube: { regionCode: "GB" }, brave: { country: "GB" } },
  us: { label: "United States", google: { gl: "us", hl: "en" }, youtube: { regionCode: "US" }, brave: { country: "US" } },
};

// Categories that fit most consumer products and services. Keywords drive the no-key classifier.
export const GENERIC_CATEGORIES = [
  ["price_cost", "Price, fees & hidden charges", "Too expensive, price rises, surge pricing, hidden fees, not worth the money.", ["\\b(price|prices|cost|costs|expensive|overpriced|fee|fees|charges?|surge|hidden|not worth|rip ?off)\\b"]],
  ["quality_reliability", "Quality & reliability", "Product or service breaks, fails, is defective, inconsistent or does not work as promised.", ["\\b(broken|not working|doesn'?t work|stopped working|fault|faulty|defect|failed|failure|keeps (crashing|failing)|poor quality|bad quality)\\b"]],
  ["availability_access", "Availability & access", "Not available nearby, out of stock, no coverage, long distances, closed or full.", ["near me|where (to|can i)|\\b(not available|unavailable|out of stock|no (service|coverage|stations?|options?)|closed|full|sold out)\\b"]],
  ["speed_wait", "Delays & waiting", "Late delivery, long queues or wait times, slow service, missed appointments.", ["\\b(late|delay|delayed|waiting|wait time|queue|slow|took (hours|days|weeks)|never (arrived|came)|missed)\\b"]],
  ["customer_support", "Customer support", "Hard to reach support, complaints ignored, unhelpful agents, no accountability.", ["\\b(customer (service|care|support)|helpline|complain|complaint|no response|ignored|chatbot|contact number|phone number)\\b"]],
  ["refunds_billing", "Refunds, billing & payments", "Refund refused or slow, double charges, payment failures, billing errors, cancellation trouble.", ["\\b(refund|refunds|charged twice|double charged|overcharged|billing error|wrong bill|payment failed|cancel|cancellation|chargeback)\\b"]],
  ["digital_experience", "App, website & digital", "App or website bugs, login problems, confusing UX, booking or tracking not working.", ["\\b(app|website|login|log in|sign in|otp|update|tracking|booking|portal)\\b"]],
  ["trust_safety", "Trust, scams & safety", "Fraud, scams, misleading claims, data or personal safety concerns.", ["\\b(scam|fraud|fake|cheat|cheated|misleading|unsafe|danger|dangerous|safety|privacy|data leak)\\b"]],
  ["information_rules", "How-to questions & confusing rules", "Unclear rules, eligibility, instructions or terms; people unsure how things work.", ["^(how (do|to|does|can)|can (i|you)|is it|what (is|are)|which)\\b|\\b(rules|eligib|terms|confus|explained)\\b"]],
  ["other", "Other", "Clear customer pain point that does not fit any category above.", []],
];

export const GENERIC_PERSONAS = [
  ["first_time_user", "First-time / new user", "Trying the product or service for the first time; unfamiliar with how it works.", ["\\b(first time|new to|beginner|just (bought|started|signed up))\\b"]],
  ["regular_user", "Regular user", "Uses it often and compares with past experience.", ["\\b(every (day|week)|always use|regular|daily|for years)\\b"]],
  ["budget_conscious", "Budget-conscious customer", "Price-sensitive; talks mainly about cost and value.", ["\\b(cheap|cheapest|budget|afford|save money|discount)\\b"]],
  ["small_business", "Small business / professional user", "Uses it for work or a business.", ["\\b(my (business|shop|store|restaurant|company|clients?)|for work|b2b|fleet)\\b"]],
  ["general_citizen", "General customer", "Persona cannot be inferred.", []],
];

const TopicDraft = z.object({
  context_keywords: z.array(z.string()).describe("8-20 lowercase words/stems that indicate a text is about this topic, in English plus key local-language terms"),
  irrelevant_keywords: z.array(z.string()).describe("Words that mark off-topic or shopping/homework texts for this topic"),
  subreddit_query: z.string().describe("Reddit boolean search query (OR-joined terms) to find this topic inside general subreddits"),
  regions: z.array(z.object({
    region: z.string().describe("india | europe | us"),
    subreddits: z.array(z.string()).describe("8-14 real subreddit names (no r/) where people from this region discuss this topic"),
    queries: z.array(z.string()).describe("10-14 short Reddit/YouTube search queries about problems with this topic in this region"),
    suggest_seeds: z.array(z.string()).describe("6-10 short Google search seeds people in this region type about this topic"),
    web_queries: z.array(z.string()).describe("4-6 web searches for complaints and reviews, may use site: for regional complaint/review sites"),
    x_queries: z.array(z.string()).describe("1-2 X recent-search queries with OR groups, ending in -is:retweet"),
  })),
  categories: z.array(z.object({
    id: z.string().describe("snake_case id"),
    name: z.string(),
    description: z.string(),
    keywords: z.array(z.string()).describe("1-3 JavaScript regex source strings (case-insensitive) that signal this category"),
  })).describe("10-14 customer pain-point categories specific to this topic, ending with id 'other'"),
  personas: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    keywords: z.array(z.string()).describe("regex source strings that reveal this persona from what people write about themselves"),
  })).describe("5-8 customer personas for this topic, ending with id 'general_citizen'"),
});

function validRegex(s) {
  try {
    new RegExp(s, "i");
    return true;
  } catch {
    return false;
  }
}

/**
 * overrides (optional, for hand-written topics): context_keywords, irrelevant_keywords, subreddit_query,
 * regions: { india|europe|us: { subreddits, queries, suggest_seeds, web_queries, x_queries, google_extra } },
 * categories / personas: topic-specific entries placed before the generic ones (first match wins).
 */
export async function createTopic({ id, label, description, useClaude, overrides = {} }) {
  const dir = path.join(TOPICS_DIR, id);
  if (fs.existsSync(dir)) throw new Error(`${dir} already exists - edit its files instead`);
  const words = label.toLowerCase();

  let draft = null;
  if (useClaude) {
    draft = await structuredCall({
      system: "You design market-research search plans. Output only realistic, currently active subreddit names and search terms that real customers use.",
      user: `Topic: ${label}\nScope: ${description || label}\nMarkets: India, Europe (UK + EU), United States.\nDraft the search plan, pain-point categories and personas for finding the top customer pain points about this topic.`,
      schema: TopicDraft,
      effort: "medium",
    });
  }

  const topic = {
    id,
    label,
    description: description || label,
    context_keywords: overrides.context_keywords || (draft?.context_keywords?.length ? draft.context_keywords : words.split(/\s+/).filter((w) => w.length > 2)),
    irrelevant_keywords: (overrides.irrelevant_keywords || draft?.irrelevant_keywords || []).filter(validRegex),
    subreddit_query: overrides.subreddit_query || draft?.subreddit_query || words.split(/\s+/).join(" OR "),
  };

  const regions = { _comment: draft ? "Drafted by Claude - review subreddits and queries before a big run." : "Template - replace the example subreddits and queries with ones specific to this topic." };
  for (const [rid, loc] of Object.entries(LOCALES)) {
    const d = draft?.regions?.find((r) => r.region.toLowerCase() === rid);
    regions[rid] = {
      ...loc,
      subreddits: d?.subreddits || { india: ["india", "IndiaSpeaks", "bangalore", "mumbai", "delhi"], europe: ["unitedkingdom", "AskUK", "europe", "germany", "ireland"], us: ["AskAnAmerican", "personalfinance", "nyc", "LosAngeles", "Chicago"] }[rid],
      queries: d?.queries || [`${words} problem`, `${words} complaint`, `${words} worst experience`, `${words} not working`, `${words} expensive`],
      suggest_seeds: d?.suggest_seeds || [words, `${words} near me`, `${words} cost`, `${words} problem`],
      web_queries: d?.web_queries || [`${words} complaint`, `${words} review problems`],
      x_queries: d?.x_queries || [`("${words}") (complaint OR problem OR worst OR scam) -is:retweet`],
      ...(overrides.regions?.[rid] || {}),
    };
  }

  let categories = draft?.categories?.length
    ? draft.categories.map((c) => ({ ...c, keywords: c.keywords.filter(validRegex) }))
    : GENERIC_CATEGORIES.map(([cid, name, desc, keywords]) => ({ id: cid, name, description: desc, keywords }));
  if (overrides.categories) categories = [...overrides.categories, ...categories.filter((c) => !overrides.categories.some((o) => o.id === c.id))];
  if (!categories.some((c) => c.id === "other")) categories.push({ id: "other", name: "Other", description: "Clear customer pain point that does not fit any category above.", keywords: [] });
  let personas = draft?.personas?.length
    ? draft.personas.map((p) => ({ ...p, keywords: p.keywords.filter(validRegex) }))
    : GENERIC_PERSONAS.map(([pid, name, desc, keywords]) => ({ id: pid, name, description: desc, keywords }));
  if (overrides.personas) personas = [...overrides.personas, ...personas.filter((p) => !overrides.personas.some((o) => o.id === p.id))];
  if (!personas.some((p) => p.id === "general_citizen")) personas.push({ id: "general_citizen", name: "General customer", description: "Persona cannot be inferred.", keywords: [] });

  fs.mkdirSync(dir, { recursive: true });
  writeJson(path.join(dir, "topic.json"), topic);
  writeJson(path.join(dir, "regions.json"), regions);
  writeJson(path.join(dir, "taxonomy.json"), { _comment: draft ? "Drafted by Claude." : overrides.categories ? "Topic-specific categories first, then generic ones. The keyword classifier uses the first matches." : "Generic categories - rename or add topic-specific ones.", categories, personas });
  return dir;
}
