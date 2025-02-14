"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";

// Add OP Sepolia chain configuration
const opSepolia = {
  id: 11155420,
  name: "OP Sepolia",
  network: "op-sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        `https://opt-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      ],
    },
    public: {
      http: [
        `https://opt-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://sepolia-optimistic.etherscan.io",
    },
  },
  testnet: true,
} as const;

// Create a client-side only QueryClient
const queryClient = new QueryClient();

// Configure chains - OP Sepolia first for better UX
export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [opSepolia, optimism, mainnet] as const,
    transports: {
      // RPC URL for each chain with fallbacks
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
      ),
      [optimism.id]: http(
        `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
      ),
      [opSepolia.id]: http(
        `https://opt-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
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
            initialChainId: opSepolia.id,
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
