import { SafeFactory } from "@safe-global/protocol-kit";
import { EthersAdapter } from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import { config } from "./config";

let safeClient: SafeFactory | null = null;

export async function getSafeClient() {
  if (!safeClient) {
    if (!config.safe.agentAddress || !config.safe.agentPrivateKey) {
      throw new Error(
        "Agent address and private key must be configured in .env"
      );
    }

    // Create ethers provider and adapter
    const provider = new ethers.JsonRpcProvider(config.safe.rpcUrl);
    const signer = new ethers.Wallet(config.safe.agentPrivateKey, provider);
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer,
    });

    // Initialize Safe factory
    safeClient = await SafeFactory.create({ ethAdapter });
  }

  return safeClient;
}

export async function createSafeForAgent() {
  const factory = await getSafeClient();
  if (!factory) {
    throw new Error("Failed to initialize Safe factory");
  }

  const safeAccountConfig = {
    owners: [config.safe.agentAddress],
    threshold: 1,
  };

  const saltNonce = Math.floor(Math.random() * 1000000).toString();
  const safe = await factory.deploySafe({ safeAccountConfig, saltNonce });
  const safeAddress = await safe.getAddress();

  return { safe, safeAddress };
}
