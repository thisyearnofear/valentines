"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

// Create a client-side only QueryClient
const queryClient = new QueryClient();

// Prioritize Optimism by putting it first in the chains array
const config = createConfig(
  getDefaultConfig({
    // Your dApps chains - Optimism first for better UX
    chains: [optimism, mainnet] as const,
    transports: {
      // RPC URL for each chain
      [mainnet.id]: http(),
      [optimism.id]: http(),
    },

    // Required API Keys
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",

    // Required App Info
    appName: "lub-u",

    // Optional App Info
    appDescription: "Share love with frens",
    appUrl: "https://lub-u.vercel.app",
    appIcon: "/favicon.ico",
  })
);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="minimal"
          customTheme={{
            "--ck-accent-color": "#fad1cf",
            "--ck-accent-text-color": "#000000",
          }}
          options={{
            initialChainId: optimism.id,
            // Show the network switcher and enforceSupportedChains
            hideNoWalletCTA: false,
            enforceSupportedChains: true,
            // Custom text for better UX
            walletConnectName: "Other Wallets",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
