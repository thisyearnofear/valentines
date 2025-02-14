"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [mainnet, optimism],
    transports: {
      // RPC URL for each chain
      [mainnet.id]: http(),
      [optimism.id]: http(),
    },

    // Required API Keys
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",

    // Required App Info
    appName: "Give Me Love",

    // Optional App Info
    appDescription:
      "A valentines-inspired web3 app where people can give each other love through hearts",
    appUrl: "https://givemelove.vercel.app",
    appIcon: "/favicon.ico",
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
