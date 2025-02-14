"use client";

import { ConnectKitButton } from "connectkit";
import { useAccount, useChainId } from "wagmi";
import { optimism } from "wagmi/chains";
import { useEffect, useState } from "react";

export default function WalletConnect() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);

  // Only show the component after it's mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 transition-colors text-sm"
        aria-label="Loading wallet connection"
      >
        Loading...
      </button>
    );
  }

  return (
    <ConnectKitButton.Custom>
      {({ show, truncatedAddress, ensName }) => {
        const showWrongNetwork = isConnected && chainId !== optimism.id;

        return (
          <button
            onClick={show}
            className={`p-2 rounded-lg transition-colors text-sm ${
              showWrongNetwork
                ? "bg-red-200 dark:bg-red-900 hover:bg-red-300 dark:hover:bg-red-800"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {isConnected ? (
              <>
                {showWrongNetwork
                  ? "Switch to Optimism"
                  : ensName ?? truncatedAddress}
              </>
            ) : (
              "Connect Wallet"
            )}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
