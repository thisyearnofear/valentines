import { sepolia } from "viem/chains";

interface Config {
  agentPrivateKey: string;
  agentAddress: string;
  googleApiKey: string;
  alchemyApiKey: string;
}

function validateConfig(): Config {
  const agentPrivateKey = process.env.AGENT_PRIVATE_KEY;
  const agentAddress = process.env.AGENT_ADDRESS;
  const googleApiKey = process.env.GOOGLE_API_KEY;
  const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

  if (!agentPrivateKey) {
    throw new Error("AGENT_PRIVATE_KEY environment variable is not set");
  }

  if (!agentAddress) {
    throw new Error("AGENT_ADDRESS environment variable is not set");
  }

  if (!googleApiKey) {
    throw new Error("GOOGLE_API_KEY environment variable is not set");
  }

  if (!alchemyApiKey) {
    throw new Error(
      "NEXT_PUBLIC_ALCHEMY_API_KEY environment variable is not set"
    );
  }

  // Format private key
  const formattedPrivateKey = agentPrivateKey.startsWith("0x")
    ? agentPrivateKey
    : `0x${agentPrivateKey}`;

  return {
    agentPrivateKey: formattedPrivateKey,
    agentAddress,
    googleApiKey,
    alchemyApiKey,
  };
}

export const config = validateConfig();

// LangSmith Configuration
export const langsmith = {
  apiKey: process.env.LANGCHAIN_API_KEY,
  projectName: process.env.LANGCHAIN_PROJECT || "Safe Agent",
  tracing: process.env.LANGCHAIN_TRACING_V2 === "true",
};

// Safe Configuration
export const safe = {
  rpcUrl: "https://rpc.ankr.com/eth_sepolia",
  chain: sepolia,
  agentAddress: config.agentAddress,
  agentPrivateKey: config.agentPrivateKey,
};

// Model Configuration
export const model = {
  geminiApiKey: process.env.GEMINI_API_KEY,
};
