import { mainnet, optimism } from "wagmi/chains";
import { http } from "wagmi";
import { createConfig } from "wagmi";

// Configure chains
export const chains = [mainnet, optimism];

// Create wagmi config
export const config = createConfig({
  chains: chains,
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
  },
});
