import {
  useAccount,
  useReadContract,
  useWriteContract,
  useChainId,
} from "wagmi";
import { CLICKER_ABI, CLICKER_ADDRESS } from "../config/contracts";
import { parseEther } from "viem";
import { useEffect } from "react";

// Contract constants
const MAX_CLICKS = BigInt(69420);
const MAX_PER_PURCHASE = BigInt(420);
const CLICK_PRICE = parseEther("0.0001");

export function useClicker() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress =
    CLICKER_ADDRESS[chainId as keyof typeof CLICKER_ADDRESS];

  // Only log in development and when values change
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Contract setup:", {
        chainId,
        contractAddress,
        userAddress: address,
      });
    }
  }, [chainId, contractAddress, address]);

  const isReady = Boolean(contractAddress && chainId === 11155420);

  const { data: remainingClicks } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: CLICKER_ABI,
    functionName: "getRemainingAttributions",
    query: {
      enabled: isReady,
    },
  });

  const { data: currentOwnershipShare } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: CLICKER_ABI,
    functionName: "getCurrentOwnershipShare",
    args: address ? [address] : undefined,
    query: {
      enabled: isReady && Boolean(address),
    },
  });

  const { data: ownershipShare } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: CLICKER_ABI,
    functionName: "getOwnershipShare",
    args: address ? [address] : undefined,
    query: {
      enabled: isReady && Boolean(address),
    },
  });

  const maxPerWalletValue = MAX_PER_PURCHASE;
  const userRemainingClicksValue = address ? MAX_PER_PURCHASE : undefined;

  // Write functions
  const { writeContractAsync } = useWriteContract();

  const handleBuyClicks = async (amount: number, recipient?: string) => {
    if (!isReady) {
      throw new Error("Contract not ready or wrong network");
    }

    if (!contractAddress || !amount) {
      const missingParams = {
        contractAddress: !contractAddress,
        amount: !amount,
      };
      console.error("Missing parameters:", missingParams);
      throw new Error(
        `Missing required parameters: ${Object.entries(missingParams)
          .filter(([, isMissing]) => isMissing)
          .map(([param]) => param)
          .join(", ")}`
      );
    }

    try {
      console.log("Buying lub:", {
        amount,
        recipient: recipient || "self",
        clickPrice: CLICK_PRICE.toString(),
      });

      const value = CLICK_PRICE * BigInt(amount);
      const result = await writeContractAsync({
        abi: CLICKER_ABI,
        address: contractAddress,
        functionName: "buyClickAttribution",
        args: [
          BigInt(amount),
          (recipient ||
            "0x0000000000000000000000000000000000000000") as `0x${string}`,
        ],
        value,
      });

      console.log("Transaction submitted:", result);
      return result;
    } catch (error) {
      console.error("Error buying lub:", error);
      throw error;
    }
  };

  return {
    maxClicks: MAX_CLICKS,
    maxPerWallet: maxPerWalletValue,
    clickPrice: CLICK_PRICE,
    remainingClicks: remainingClicks as bigint,
    userRemainingClicks: userRemainingClicksValue,
    ownershipShare: ownershipShare as bigint,
    currentOwnershipShare: currentOwnershipShare as bigint,
    buyClicks: handleBuyClicks,
  };
}
