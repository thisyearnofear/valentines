import { z } from "zod";
import Safe, { SafeFactory } from "@safe-global/protocol-kit";
import { EthersAdapter } from "@safe-global/protocol-kit";
import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";
import { ethers } from "ethers";
import { config } from "../config";

// Safe contract addresses for Linea mainnet
const LINEA_SAFE_ADDRESSES = {
  SAFE_PROXY_FACTORY_ADDRESS: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
  SAFE_ADDRESS: "0x69f4D1788e39c87893C980c06EdF4b7f686e2938",
  MULTI_SEND_ADDRESS: "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761",
  MULTI_SEND_CALL_ONLY_ADDRESS: "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
  COMPATIBILITY_FALLBACK_HANDLER_ADDRESS:
    "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
  SIGN_MESSAGE_LIB_ADDRESS: "0x98FFBBF51bb33A056B08ddf711f289936AafF717",
  CREATE_CALL_ADDRESS: "0x7cbB62EaB3071767e8c4e2859CMod8EF5d0eB593",
  SIMULATE_TX_ACCESSOR_ADDRESS: "0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da",
};

export class SafeTools {
  private signer: ethers.Wallet;
  private ethAdapter: EthersAdapter;
  private safe!: Safe;
  private provider: ethers.JsonRpcProvider;

  constructor() {
    // Initialize provider with Linea mainnet RPC URL
    this.provider = new ethers.JsonRpcProvider(
      `https://linea-mainnet.infura.io/v3/${config.alchemyApiKey}`
    );

    // Initialize signer with private key from config and connect to provider
    this.signer = new ethers.Wallet(config.agentPrivateKey, this.provider);

    // Create ethAdapter
    this.ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: this.signer,
    });
  }

  getEthAdapter(): EthersAdapter {
    return this.ethAdapter;
  }

  async getEthBalance(address: string): Promise<string> {
    if (!address.startsWith("0x") || address.length !== 42) {
      throw new Error("Invalid address.");
    }

    try {
      // Get balance directly from the provider
      const balance = await this.provider.getBalance(address);
      const ethBalance = ethers.formatEther(balance);

      return `The current balance of the Safe at address ${address} is ${Number(
        ethBalance
      ).toLocaleString("en-US", { maximumFractionDigits: 6 })} ETH.`;
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw new Error("Failed to fetch Safe balance");
    }
  }

  async deployNewSafe(): Promise<string> {
    const saltNonce = Math.trunc(Math.random() * 10 ** 10).toString();
    const safeFactory = await SafeFactory.create({
      ethAdapter: this.ethAdapter,
    });
    const safeAccountConfig = {
      owners: [await this.signer.getAddress()],
      threshold: 1,
    };

    const safe = await safeFactory.deploySafe({
      safeAccountConfig,
      saltNonce,
    });

    const safeAddress = await safe.getAddress();

    return `A new Safe was successfully deployed on Linea. You can see it at https://app.safe.global/home?safe=lin:${safeAddress}. The saltNonce used was ${saltNonce}.`;
  }

  async proposeSafeTransaction(params: {
    safeAddress: string;
    to: string;
    value: string;
    data: string;
  }): Promise<string> {
    const { safeAddress, to, value, data } = params;

    const safe = await Safe.create({
      ethAdapter: this.ethAdapter,
      safeAddress,
      contractNetworks: {
        59144: {
          safeSingletonAddress: LINEA_SAFE_ADDRESSES.SAFE_ADDRESS,
          safeProxyFactoryAddress:
            LINEA_SAFE_ADDRESSES.SAFE_PROXY_FACTORY_ADDRESS,
          multiSendAddress: LINEA_SAFE_ADDRESSES.MULTI_SEND_ADDRESS,
          multiSendCallOnlyAddress:
            LINEA_SAFE_ADDRESSES.MULTI_SEND_CALL_ONLY_ADDRESS,
          fallbackHandlerAddress:
            LINEA_SAFE_ADDRESSES.COMPATIBILITY_FALLBACK_HANDLER_ADDRESS,
          signMessageLibAddress: LINEA_SAFE_ADDRESSES.SIGN_MESSAGE_LIB_ADDRESS,
          createCallAddress: LINEA_SAFE_ADDRESSES.CREATE_CALL_ADDRESS,
          simulateTxAccessorAddress:
            LINEA_SAFE_ADDRESSES.SIMULATE_TX_ACCESSOR_ADDRESS,
        },
      },
    });

    const safeTransactionData: SafeTransactionDataPartial = {
      to,
      data,
      value: ethers.parseEther(value).toString(),
      operation: 0,
    };

    // Create the transaction
    const safeTransaction = await safe.createTransaction({
      transactions: [safeTransactionData],
    });

    // Sign transaction
    const signedSafeTx = await safe.signTransaction(safeTransaction);

    // Execute the transaction
    const executeTxResponse = await safe.executeTransaction(signedSafeTx);

    if (!executeTxResponse.hash) {
      throw new Error("Transaction failed - no hash returned");
    }

    return `Transaction executed on Safe at ${safeAddress}. Transaction hash: ${executeTxResponse.hash}`;
  }

  async initializeSafe(safeAddress: string) {
    this.safe = await Safe.create({
      ethAdapter: this.ethAdapter,
      safeAddress,
      contractNetworks: {
        59144: {
          // Linea mainnet chain ID
          safeSingletonAddress: LINEA_SAFE_ADDRESSES.SAFE_ADDRESS,
          safeProxyFactoryAddress:
            LINEA_SAFE_ADDRESSES.SAFE_PROXY_FACTORY_ADDRESS,
          multiSendAddress: LINEA_SAFE_ADDRESSES.MULTI_SEND_ADDRESS,
          multiSendCallOnlyAddress:
            LINEA_SAFE_ADDRESSES.MULTI_SEND_CALL_ONLY_ADDRESS,
          fallbackHandlerAddress:
            LINEA_SAFE_ADDRESSES.COMPATIBILITY_FALLBACK_HANDLER_ADDRESS,
          signMessageLibAddress: LINEA_SAFE_ADDRESSES.SIGN_MESSAGE_LIB_ADDRESS,
          createCallAddress: LINEA_SAFE_ADDRESSES.CREATE_CALL_ADDRESS,
          simulateTxAccessorAddress:
            LINEA_SAFE_ADDRESSES.SIMULATE_TX_ACCESSOR_ADDRESS,
        },
      },
    });
  }
}

// Export metadata for agent tools
export const getEthBalanceMetadata = {
  name: "getEthBalance",
  description: "Get the balance in ETH of a Safe for a given address on Linea.",
  schema: z.object({
    address: z.string().describe("The Safe address to check"),
  }),
};

export const deployNewSafeMetadata = {
  name: "deployNewSafe",
  description: "Deploy a new 1-1 Safe on Linea for the lub-u treasury.",
  schema: z.object({}),
};

export const proposeSafeTransactionMetadata = {
  name: "proposeSafeTransaction",
  description: "Propose a new transaction to a Safe.",
  schema: z.object({
    safeAddress: z.string().describe("The Safe address"),
    to: z.string().describe("The recipient address"),
    value: z.string().describe("The amount in ETH"),
    data: z.string().describe("The transaction data (hex)"),
  }),
};
