import { config } from "../src/lib/config";
import { SafeTools } from "../src/lib/tools/safe";
import { ethers } from "ethers";

const SAFE_ADDRESS = "0x7e0A89A36Ba135A79aF121f443e20860845A731b";

async function main() {
  try {
    const safeTools = new SafeTools();

    // Initialize the Safe
    console.log("Initializing Safe...");
    await safeTools.initializeSafe(SAFE_ADDRESS);

    // Propose a small transaction to ourselves (0 ETH) to verify control
    console.log("\nProposing test transaction...");
    const result = await safeTools.proposeSafeTransaction({
      safeAddress: SAFE_ADDRESS,
      to: config.agentAddress, // Send to ourselves
      value: "0", // 0 ETH
      data: "0x", // No data
    });

    console.log("\nTransaction proposed successfully!");
    console.log(result);
    console.log("\nYou can view and execute this transaction at:");
    console.log(
      `https://app.safe.global/transactions/queue?safe=lin:${SAFE_ADDRESS}`
    );
  } catch (error) {
    console.error("Error during test:", error);
    process.exit(1);
  }
}

main();
