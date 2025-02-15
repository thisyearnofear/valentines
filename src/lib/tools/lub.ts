import { z } from "zod";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { CLICKER_ABI, CLICKER_ADDRESS } from "../../config/contracts";

export const getLubStats = async () => {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  // Get total clicks from contract
  const totalClicks = await publicClient.readContract({
    address: CLICKER_ADDRESS[11155420],
    abi: CLICKER_ABI,
    functionName: "getCurrentOwnershipShare",
    args: [process.env.AGENT_ADDRESS as `0x${string}`],
  });

  // Calculate ownership distribution
  const maxClicksNum = 69420;
  const communityPercentage = (Number(totalClicks) / maxClicksNum) * 100;
  const remainingPercentage = 100 - communityPercentage;

  return `Current lub-u stats:
- Total lubs: ${totalClicks.toString()}
- Community ownership: ${communityPercentage.toFixed(2)}%
- Remaining to be claimed: ${remainingPercentage.toFixed(2)}%
- Price per lub: 0.0001 ETH`;
};

export const getLubStatsMetadata = {
  name: "getLubStats",
  description:
    "Get current statistics about lub-u, including total lubs, community ownership percentage, and price per lub.",
  schema: z.object({}),
};
