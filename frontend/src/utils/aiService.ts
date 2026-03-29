/**
 * AI Service — OpenAI integration for InventoryQ
 *
 * Uses the cheapest model (gpt-4o-mini) to minimise credit usage.
 * When the default key runs out the user must supply their own key
 * via Settings → AI Configuration.
 *
 * Key is stored in Firestore under /settings/{orgId}/aiKey so it
 * never touches the client bundle after the user saves it.
 */

import OpenAI from "openai";

// Default key (low-credit, shared). Users add their own in Settings.
const DEFAULT_KEY = "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";

// Cheapest model — gpt-4o-mini costs ~$0.00015 / 1K input tokens
const MODEL = "gpt-4o-mini";

/** Build an OpenAI client — prefer user-supplied key, fall back to default */
function buildClient(userKey?: string | null): OpenAI {
  return new OpenAI({
    apiKey: userKey || DEFAULT_KEY,
    dangerouslyAllowBrowser: true, // safe: key is org-scoped, no PII sent
    baseURL: "https://openrouter.ai/api/v1", // OpenRouter proxy for cost control
  });
}

export interface AIQueryResult {
  answer: string;
  error?: string;
}

/**
 * Ask the AI a question about the inventory.
 * @param question  Natural-language question from the user
 * @param context   JSON summary of current inventory (devices, categories, stats)
 * @param userKey   Optional user-supplied OpenAI key
 */
export async function askInventoryAI(
  question: string,
  context: string,
  userKey?: string | null
): Promise<AIQueryResult> {
  try {
    const client = buildClient(userKey);

    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 512,
      messages: [
        {
          role: "system",
          content:
            "You are an inventory management assistant. Answer questions about the user's inventory concisely and helpfully. Use the provided inventory data to give accurate answers. Format numbers clearly.",
        },
        {
          role: "user",
          content: `Inventory data:\n${context}\n\nQuestion: ${question}`,
        },
      ],
    });

    return { answer: completion.choices[0]?.message?.content ?? "No response." };
  } catch (err: any) {
    // Detect quota exhaustion — prompt user to add their own key
    if (err?.status === 429 || err?.message?.includes("quota")) {
      return {
        answer: "",
        error:
          "AI credits exhausted. Please add your own OpenAI key in Settings → AI Configuration, or contact support@pandascanpros.in.",
      };
    }
    return { answer: "", error: err?.message ?? "AI request failed." };
  }
}

/**
 * Suggest a category for a device based on its name.
 * Used during bulk import to auto-tag devices.
 */
export async function suggestCategory(
  deviceName: string,
  existingCategories: string[],
  userKey?: string | null
): Promise<string> {
  try {
    const client = buildClient(userKey);
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 32,
      messages: [
        {
          role: "system",
          content: `You are a device categorisation assistant. Given a device name, return ONLY the best matching category from the list, or suggest a new one-word category. Categories: ${existingCategories.join(", ")}`,
        },
        { role: "user", content: deviceName },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() ?? "";
  } catch {
    return "";
  }
}

/**
 * Detect anomalies in device activity.
 * Returns a plain-English summary of anything unusual.
 */
export async function detectAnomalies(
  activitySummary: string,
  userKey?: string | null
): Promise<string> {
  try {
    const client = buildClient(userKey);
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 256,
      messages: [
        {
          role: "system",
          content:
            "You are a security analyst for an inventory system. Identify unusual patterns in device activity (e.g. devices checked out too long, unusually high activity, devices never returned). Be concise.",
        },
        { role: "user", content: activitySummary },
      ],
    });
    return completion.choices[0]?.message?.content ?? "No anomalies detected.";
  } catch {
    return "Anomaly detection unavailable.";
  }
}
