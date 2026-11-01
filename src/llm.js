import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { log, sleep } from "./util.js";

export const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

let client;
function getClient() {
  // Resolves ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN / `ant auth login` profile automatically.
  client ??= new Anthropic({ maxRetries: 4 });
  return client;
}

/**
 * One structured-output call. Returns the zod-validated object, or null if the model declined
 * or the output could not be parsed. Server-side refusal fallback is enabled ("default" routing).
 */
export async function structuredCall({ system, user, schema, effort = "low", maxTokens = 16000 }) {
  let lastLocalError = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await getClient().beta.messages.parse({
        model: MODEL,
        max_tokens: maxTokens,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        // The system prompt (instructions + taxonomy) is identical on every call -> cache it.
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: user }],
        output_config: { effort, format: betaZodOutputFormat(schema) },
      });
      if (response.stop_reason === "refusal") {
        log(`llm: request declined (${response.stop_details?.category ?? "unknown"}) - skipping batch`);
        return null;
      }
      if (response.stop_reason === "max_tokens") {
        log("llm: hit max_tokens - output truncated, skipping batch (lower --batch-size)");
        return null;
      }
      if (response.parsed_output) return response.parsed_output;
      log("llm: response did not parse, retrying");
    } catch (err) {
      if (err instanceof Anthropic.AuthenticationError) throw err;
      if (err instanceof Anthropic.BadRequestError) throw err;
      if (err instanceof Anthropic.APIError) {
        // 429/5xx/network were already retried by the SDK (maxRetries); one more slow retry here.
        log(`llm: ${err.message} - retrying`);
        await sleep(5000);
        continue;
      }
      // Output-validation errors from parse() and client-side setup errors (e.g. no credentials)
      // land here: retry once, and if it happens twice, stop the run instead of burning batches.
      lastLocalError = err;
      if (attempt === 0) log(`llm: ${String(err.message).slice(0, 160)} - retrying once`);
    }
  }
  if (lastLocalError) throw lastLocalError;
  return null;
}
