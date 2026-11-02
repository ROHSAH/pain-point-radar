// Keeps Brave Search API usage inside the free plan.
// - Monthly cap shared by every topic and run (BRAVE_MONTHLY_LIMIT, default 1000 calls).
// - Per-run cap (--max-web-calls, default 300).
// - A query+page already fetched in the last 30 days is skipped, so re-runs don't spend quota.
// State lives in data/_brave_usage.json (git-ignored with the rest of data/).
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../topic.js";
import { log } from "../util.js";

const DEFAULT_FILE = path.join(ROOT, "data", "_brave_usage.json");
const REUSE_DAYS = 30;

export class BudgetExhausted extends Error {}

const thisMonth = () => new Date().toISOString().slice(0, 7);

function load(FILE) {
  try {
    const s = JSON.parse(fs.readFileSync(FILE, "utf8"));
    if (s.month !== thisMonth()) return { month: thisMonth(), calls: 0, seen: s.seen || {} };
    return s;
  } catch {
    return { month: thisMonth(), calls: 0, seen: {} };
  }
}

function save(FILE, state) {
  // Forget cache entries older than the reuse window so the file stays small.
  const cutoff = Date.now() - REUSE_DAYS * 86400_000;
  for (const [k, t] of Object.entries(state.seen)) if (Date.parse(t) < cutoff) delete state.seen[k];
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(state, null, 1));
}

export function createBudget({ perRun = 300, monthly = Number(process.env.BRAVE_MONTHLY_LIMIT) || 1000, file = DEFAULT_FILE } = {}) {
  const state = load(file);
  let runCalls = 0;
  let skipped = 0;
  return {
    /** true when this query/page was fetched recently and should not be paid for again */
    seenRecently(key) {
      const t = state.seen[key];
      const fresh = t && Date.now() - Date.parse(t) < REUSE_DAYS * 86400_000;
      if (fresh) skipped++;
      return fresh;
    },
    /** call before each request; throws BudgetExhausted when a cap is reached */
    reserve() {
      if (state.calls >= monthly) throw new BudgetExhausted(`monthly Brave limit reached (${state.calls}/${monthly} calls in ${state.month}); set BRAVE_MONTHLY_LIMIT if your plan allows more`);
      if (runCalls >= perRun) throw new BudgetExhausted(`per-run limit reached (${perRun} calls); raise --max-web-calls or run again later`);
      state.calls++;
      runCalls++;
    },
    done(key) {
      state.seen[key] = new Date().toISOString();
      save(file, state);
    },
    summary() {
      return `brave: ${runCalls} calls this run, ${skipped} repeats skipped, ${state.calls}/${monthly} used in ${state.month}`;
    },
    flush() {
      save(file, state);
      log(this.summary());
    },
  };
}
