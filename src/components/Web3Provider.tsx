"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, linea } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";

// Create a client-side only QueryClient
const queryClient = new QueryClient();

// Configure chains - Linea first for better UX
export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [linea, mainnet] as const,
    transports: {
      // RPC URL for each chain with fallbacks
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
      ),
      [linea.id]: http(
        `https://linea-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
      ),
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

    // Add Farcaster Frame connector
    connectors: [farcasterFrame()],
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
            initialChainId: linea.id,
            // Show the network switcher and enforce supported chains
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
