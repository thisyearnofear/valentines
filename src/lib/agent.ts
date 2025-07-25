import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "./config";
import * as tools from "./tools";
import { RunnableRouter } from "langchain/runnables";

function parseJsonFromText(text: string): any {
  const match = text.match(/```json([\s\S]*?)```/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {
      // fallback
    }
  }
  try {
    // fallback: try all curly blocks
    const curly = text.match(/{[\s\S]+}/);
    if (curly) {
      return JSON.parse(curly[0]);
    }
  } catch {}
  return null;
}

export const runAgent = async (input: string) => {
  if (!config.googleApiKey) throw new Error("Google API key is not configured");

  const router = RunnableRouter.from({
    stats: async () => {
      // Example: query subgraph for stats
      const query = `query { clicks(first:1){id} }`;
      const stats = await tools.querySubgraph(query);
      return { type: "Insight", stats };
    },
    balance: async () => {
      const bal = await tools.getTreasuryBalance();
      return { type: "Insight", treasury: bal };
    },
    proposal: async () => {
      // Example insight/proposal stub
      return { type: "Proposal", proposal: "Spend 1 lub on snacks (not real)!" };
    },
    default: async () => {
      return { type: "Insight", message: "No match, but here's a lub fact: self-lub is important!" };
    }
  }).withFallback("default");

  let route = "default";
  if (/stats/i.test(input)) route = "stats";
  else if (/balance/i.test(input)) route = "balance";
  else if (/proposal/i.test(input)) route = "proposal";

  // Model call
  const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-pro",
    apiKey: config.googleApiKey,
    maxOutputTokens: 2048,
    temperature: 0.1,
  });

  const data = await router.invoke(route, {});
  const systemPrompt = `Return a JSON ${data.type === "Proposal" ? "Proposal" : "Insight"} object ONLY in a markdown json block.`;
  const userPrompt = typeof data === "object" ? JSON.stringify(data) : String(data);

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  const response = await model.invoke(fullPrompt);
  if (!response?.text) throw new Error("No response from model");

  const parsed = parseJsonFromText(response.text) ?? { raw: response.text };
  return parsed;
};

// Example usage
if (require.main === module) {
  runAgent(process.argv[2] || "gm").then(console.log);
}
