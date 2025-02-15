import { config } from "../src/lib/config";
import { SafeTools } from "../src/lib/tools/safe";
import { SafeFactory } from "@safe-global/protocol-kit";
import { ethers } from "ethers";

async function main() {
  try {
    console.log("🔐 Checking environment configuration...");
    // Only log presence of required variables, not their values
    const requiredVars = [
      "AGENT_PRIVATE_KEY",
      "AGENT_ADDRESS",
      "GOOGLE_API_KEY",
      "NEXT_PUBLIC_ALCHEMY_API_KEY",
    ];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      console.error("❌ Missing required environment variables:", missingVars);
      process.exit(1);
    }

    console.log("✅ All required environment variables are set");

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(
      `https://linea-mainnet.infura.io/v3/${config.alchemyApiKey}`
    );

    // Check balance without exposing the address
    const balance = await provider.getBalance(config.agentAddress);
    console.log(
      "\n💰 Current agent balance:",
      ethers.formatEther(balance),
      "ETH"
    );

    if (balance.toString() === "0") {
      console.log("\n⚠️ No ETH balance found. Please get some Linea ETH from:");
      console.log("1. Bridge ETH to Linea: https://bridge.linea.build/");
      console.log("2. Buy ETH directly on Linea using an exchange");
      process.exit(1);
    }

    const safeTools = new SafeTools();

    // Deploy a new Safe
    console.log("\n🏗️ Deploying new Safe...");
    const ethAdapter = safeTools.getEthAdapter();
    const safeFactory = await SafeFactory.create({ ethAdapter });
    const safeAccountConfig = {
      owners: [config.agentAddress],
      threshold: 1,
    };
    const saltNonce = Math.trunc(Math.random() * 10 ** 10).toString();
    const safe = await safeFactory.deploySafe({
      safeAccountConfig,
      saltNonce,
    });
    const safeAddress = await safe.getAddress();
    console.log(`✅ Safe deployed successfully`);
    console.log(`📋 Safe Address: ${safeAddress}`);
    console.log(
      `🔗 View on Safe UI: https://app.safe.global/home?safe=lin:${safeAddress}`
    );

    // Initialize the deployed Safe
    console.log("\n🔄 Initializing Safe...");
    await safeTools.initializeSafe(safeAddress);
    console.log("✅ Safe initialized successfully!");
  } catch (error) {
    console.error("\n❌ Error during test:", error);
    process.exit(1);
  }
}

main();
