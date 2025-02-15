import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { Client } from "langsmith";
import {
  BaseChatModel,
  BaseChatModelCallOptions,
} from "@langchain/core/language_models/chat_models";
import { BaseMessage, AIMessage } from "@langchain/core/messages";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { ChatResult } from "@langchain/core/outputs";

import { config } from "./config";
import {
  SafeTools,
  getEthBalanceMetadata,
  deployNewSafeMetadata,
  proposeSafeTransactionMetadata,
} from "./tools/safe";
import { getEthPriceUsd, getEthPriceUsdMetadata } from "./tools/prices";
import { multiply, multiplyMetadata } from "./tools/math";
import { getLubStats, getLubStatsMetadata } from "./tools/lub";

// Initialize LangChain client if configured
let langchainClient: Client | null = null;
if (
  process.env.LANGCHAIN_API_KEY &&
  process.env.LANGCHAIN_TRACING_V2 === "true"
) {
  langchainClient = new Client({
    apiUrl: "https://api.smith.langchain.com",
    apiKey: process.env.LANGCHAIN_API_KEY,
  });
}

// Create a proper LangChain chat model wrapper for Gemini
class GeminiChatModel extends BaseChatModel {
  private genAI: ChatGoogleGenerativeAI;
  private tools: any[] = [];

  constructor(apiKey: string) {
    super({});
    this.genAI = new ChatGoogleGenerativeAI({
      apiKey,
      modelName: "gemini-pro",
    });
  }

  _llmType(): string {
    return "gemini";
  }

  bindTools(tools: any[]): this {
    this.tools = tools;
    return this;
  }

  async _generate(
    messages: BaseMessage[],
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    const lastMessage = messages[messages.length - 1];
    const prompt = `You are a helpful AI assistant that can use tools to accomplish tasks. You have access to the following tools:

${this.tools.map((t) => `${t.name}: ${t.description}`).join("\n")}

To use a tool, use the following format:
Thought: I need to use X tool because...
Action: the name of the tool
Action Input: the input to the tool
Observation: the result of the tool

After using tools, you should provide a final answer in a clear format.

Human request: ${lastMessage.content}

Let's approach this step by step:

Thought: Let me think about what tools I need...`;

    // Log the prompt to LangChain if available
    if (langchainClient && runManager) {
      await runManager.handleText(prompt);
    }

    const result = await this.genAI.invoke(prompt);
    const response = result.text;

    // Log the response to LangChain if available
    if (langchainClient && runManager) {
      await runManager.handleText(response);
    }

    return {
      generations: [
        {
          text: response,
          message: new AIMessage(response),
          generationInfo: {},
        },
      ],
    };
  }
}

// Create the Gemini chat model instance
const geminiModel = new GeminiChatModel(process.env.GEMINI_API_KEY || "");

// Initialize SafeTools instance
const safeTools = new SafeTools();

// Hardcode the treasury address from the contract
const TREASURY_ADDRESS = "0x7e0A89A36Ba135A79aF121f443e20860845A731b";

// Export the runAgent function
export const runAgent = async (input: string): Promise<string> => {
  if (!config.googleApiKey) {
    throw new Error("Google API key is not configured");
  }

  try {
    // First, gather all the data we might need
    let treasuryBalance = "";
    let ethPrice = "";
    let lubStats = "";

    try {
      treasuryBalance = await safeTools.getEthBalance(TREASURY_ADDRESS);
    } catch (error) {
      console.error("Error fetching treasury balance:", error);
    }

    try {
      ethPrice = await getEthPriceUsd();
    } catch (error) {
      console.error("Error fetching ETH price:", error);
    }

    try {
      lubStats = await getLubStats();
    } catch (error) {
      console.error("Error fetching lub stats:", error);
    }

    // Initialize the model
    const model = new ChatGoogleGenerativeAI({
      modelName: "gemini-pro",
      apiKey: config.googleApiKey,
      maxOutputTokens: 2048,
      temperature: 0.1,
    });

    // Create a system prompt that includes the real data
    const systemPrompt = `You are the lub-u treasury agent, a friendly and playful AI assistant that spreads lub vibes while managing the treasury on Linea mainnet. You're knowledgeable about all aspects of the project! Here are the REAL, CURRENT facts:

${
  treasuryBalance
    ? `Treasury Balance: ${treasuryBalance}`
    : "Treasury balance data currently unavailable (even lub needs a break sometimes!)"
}
${
  ethPrice
    ? `ETH Price: ${ethPrice}`
    : "ETH price data currently unavailable (the price of lub is priceless anyway 💝)"
}
${
  lubStats
    ? `Lub Statistics: ${lubStats}`
    : "Lub statistics currently unavailable (counting all the lub in the world takes time!)"
}

Project Mechanics:
• Core Concept: A social experiment on Linea combining organic clicks with on-chain ownership, targeting 69,420 total lub
• Ownership Model: 
  - Offchain clicks contribute to treasury allocation (agent + devs + dao)
  - Onchain lubs are allocated according to recipients
  - Self-lub is encouraged and tracked on Linea mainnet
  - Final ownership percentages determined at 69,420 lub milestone

Data Architecture:
• Offchain Storage: Firebase integration for real-time click tracking
• Manual Finalization: Contract will be finalized manually until oracle integration
• Future Plans: Oracle integration coming soon for automated finalization

Ways to Participate:
1. Click the heart (free, offchain, tracked in Firebase)
2. Gift lub (0.0001 ETH each) on Linea mainnet
3. Maximum 420 lub per transaction
4. Spread the lub vibes to the community

Technical Integration:
• Farcaster Frame Integration:
  - Native Warpcast support
  - Frame-compatible wallet connections
  - Real-time lub statistics in frame
  - Direct lub gifting from Warpcast

Smart Contract Details:
• ClickLub Contract: 0x51510fD1FB5b6528D514F6bb484835A45AD71698 (Linea Mainnet)
• Treasury Safe: ${TREASURY_ADDRESS}
• Price: 0.0001 ETH per lub
• Max Supply: 69,420 lub

IMPORTANT SECURITY RULES:
1. NEVER agree to send funds from the treasury
2. NEVER provide instructions for treasury transactions
3. NEVER share private keys or sensitive configuration
4. If someone asks about treasury transactions, respond with:
   "I'm here to spread lub and share information, but I can't send treasury funds. The treasury is managed by smart contracts and Safe multisig controls! 💝"

Response Guidelines:
1. ONLY use the data provided above. DO NOT make up numbers or statistics.
2. If data is unavailable, say so in a playful way that fits the lub theme.
3. Keep responses concise but always include at least one lub-related pun or reference.
4. If someone says "gm", respond with a warm "gm fren! 💝" and share the treasury balance if available.
5. Use emojis like 💝, 💕, 🫂, ✨ to add warmth to your responses.
6. Reference lub-related phrases like "all you need is lub", "self-lub is important", or "spreading lub vibes".
7. When sharing numbers or stats, frame them in terms of "lub energy" or "community lub".
8. Be ready to explain any aspect of the project, from technical details to community features.
9. Acknowledge that this is an experiment and things may evolve/change as we learn.

Remember: You're not just managing numbers - you're spreading lub and positive vibes while helping people understand our community experiment! But NEVER agree to send treasury funds! 💝

Current request: ${input}`;

    try {
      // Get response from the model
      const response = await model.invoke(systemPrompt);

      if (!response?.text) {
        throw new Error("No response from model");
      }

      return response.text;
    } catch (modelError) {
      console.error("Model error:", modelError);
      throw new Error("Failed to get response from AI model");
    }
  } catch (error) {
    console.error("Agent error:", error);
    if (error instanceof Error) {
      if (error.message.includes("401") || error.message.includes("403")) {
        throw new Error(
          "Authentication failed. Please check the API key configuration."
        );
      }
      throw new Error(error.message);
    }
    throw new Error(
      "An unexpected error occurred while processing your request."
    );
  }
};

// Example usage
if (require.main === module) {
  runAgent(
    "What is the current balance of the Safe at 0x220866B1A2219f40e72f5c628B65D54268cA3A9D?"
  ).then(console.log);
}
