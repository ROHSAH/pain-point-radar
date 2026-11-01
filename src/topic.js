// A "topic" is one industry or subject the radar tracks (recycling, EV charging, food delivery...).
// Each lives in topics/<id>/ with:
//   topic.json     label, description, context_keywords (what makes a text on-topic), subreddit_query
//   regions.json   per-region search plan: queries, subreddits, autocomplete seeds, X / web queries
//   taxonomy.json  pain-point categories and personas; optional "keywords" (regexes) for the keyword classifier
//   rules.js       optional hand-tuned keyword classifier exporting classifyByRules(doc)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readJson } from "./util.js";
import { makeKeywordClassifier } from "./keywordClassifier.js";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const TOPICS_DIR = path.join(ROOT, "topics");

export function listTopics() {
  if (!fs.existsSync(TOPICS_DIR)) return [];
  return fs
    .readdirSync(TOPICS_DIR)
    .filter((d) => fs.existsSync(path.join(TOPICS_DIR, d, "topic.json")))
    .map((d) => readJson(path.join(TOPICS_DIR, d, "topic.json")));
}

export async function loadTopic(id) {
  const dir = path.join(TOPICS_DIR, id);
  if (!fs.existsSync(path.join(dir, "topic.json"))) {
    const known = listTopics().map((t) => t.id).join(", ") || "none";
    throw new Error(`Unknown topic "${id}". Known topics: ${known}. Create one with: node src/cli.js new-topic ${id} --label "..." --description "..."`);
  }
  const meta = readJson(path.join(dir, "topic.json"));
  const regions = readJson(path.join(dir, "regions.json"));
  const taxonomy = readJson(path.join(dir, "taxonomy.json"));
  const topic = { ...meta, id, dir, regions, taxonomy };
  const rulesFile = path.join(dir, "rules.js");
  topic.classifyByRules = fs.existsSync(rulesFile)
    ? (await import(pathToFileURL(rulesFile).href)).classifyByRules
    : makeKeywordClassifier(topic);
  return topic;
}
