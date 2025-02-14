"use client";

import { useClicker } from "../hooks/useClicker";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useState } from "react";

export default function OwnershipInfo() {
  const {
    maxClicks,
    maxPerWallet,
    clickPrice,
    remainingClicks,
    userRemainingClicks,
    ownershipShare,
    buyClicks,
  } = useClicker();
  const { isConnected } = useAccount();
  const [buyAmount, setBuyAmount] = useState(1);

  if (!isConnected) {
    return (
      <div className="text-center p-4 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg max-w-xl mx-auto mt-8">
        <p className="text-sm">Connect your wallet to gift lub 💕</p>
      </div>
    );
  }

  const handleBuy = () => {
    buyClicks(buyAmount);
  };

  const formatBasisPoints = (bps: bigint | undefined) => {
    if (!bps) return "0%";
    return `${Number(bps) / 100}%`;
  };

  const formatPrice = (amount: number) => {
    if (!clickPrice) return "...";
    return formatEther(clickPrice * BigInt(amount));
  };

  return (
    <div className="text-center p-6 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg max-w-xl mx-auto mt-8 space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Your Ownership</h3>
          <p className="text-2xl font-bold">
            {formatBasisPoints(ownershipShare)}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-1">Remaining Lub</h3>
          <p className="text-2xl font-bold">
            {remainingClicks?.toString() ?? "..."}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Gift Lub 💕</h3>
        <div className="flex items-center justify-center gap-2">
          <input
            type="number"
            min="1"
            max={userRemainingClicks ? Number(userRemainingClicks) : 420}
            value={buyAmount}
            onChange={(e) => setBuyAmount(Number(e.target.value))}
            className="w-20 px-2 py-1 text-black rounded-md border border-pink-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
          />
          <button
            onClick={handleBuy}
            disabled={!userRemainingClicks || userRemainingClicks === BigInt(0)}
            className="px-4 py-1 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            Buy for {formatPrice(buyAmount)} ETH
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Max {maxPerWallet?.toString() ?? "..."} lub per wallet •{" "}
          {formatPrice(1)} ETH per lub
        </p>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        <p>Total lub goal: {maxClicks?.toString() ?? "..."}</p>
        <p>
          Your remaining allocation: {userRemainingClicks?.toString() ?? "..."}
        </p>
      </div>
    </div>
  );
}
