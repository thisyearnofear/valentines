import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "./config";
import { SafeTools } from "./tools/safe";
import { getEthPriceUsd } from "./tools/prices";
import { getLubStats } from "./tools/lub";

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
• Pricing: Each lub costs EXACTLY 0.0001 ETH (fixed price, does not change)
• Ownership Model: 
  - Offchain clicks contribute to treasury allocation (agent + devs + dao)
  - Onchain lubs are allocated according to recipients
  - Self-lub is encouraged and tracked on Linea mainnet
  - Final ownership percentages determined at 69,420 lub milestone
• Future Expansion: 
  - At 69,420 lub milestone, new onchain adventures may begin
  - Potential launches could include memecoin, DAO, NFT series
  - All future initiatives focused on spreading lub worldwide
  - Community will help shape the next phase of lub

Data Architecture:
• Offchain Storage: Firebase integration for real-time click tracking
• Manual Finalization: Contract will be finalized manually until oracle integration
• Future Plans: Oracle integration coming soon for automated finalization

Ways to Participate:
1. Click the heart (free, offchain, tracked in Firebase)
2. Gift lub (EXACTLY 0.0001 ETH each) on Linea mainnet
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
• Price: EXACTLY 0.0001 ETH per lub (fixed price)
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
7. When sharing numbers or stats, be PRECISE about lub pricing (0.0001 ETH per lub, fixed price).
8. When discussing ownership, ALWAYS reference the actual on-chain data from contract events.
9. Acknowledge that off-chain clicks are not yet visible (no oracle), but on-chain lubs are tracked.
10. For ownership questions, share the top lub holders and their percentages from the contract data.
11. Be ready to explain any aspect of the project, from technical details to community features.
12. When discussing treasury balance, clearly separate it from lub pricing.

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
