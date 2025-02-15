import { z } from "zod";
import { createPublicClient, http, parseAbiItem } from "viem";
import { linea } from "viem/chains";
import { CLICKER_ABI, CLICKER_ADDRESS } from "../../config/contracts";

// Add web3bio identity resolution
async function resolveIdentity(address: string): Promise<string> {
  try {
    const response = await fetch(`https://api.web3.bio/profile/${address}`);
    const data = await response.json();

    // Try to find the best display name in order of preference
    const profile = data?.[0];
    if (!profile) return address;

    return (
      profile.displayName ||
      profile.handle ||
      `${address.slice(0, 6)}...${address.slice(-4)}`
    );
  } catch (error) {
    console.error("Error resolving identity:", error);
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

// Add historical data point
const LAST_MANUAL_UPDATE = {
  timestamp: new Date("2025-02-15T23:30:00-05:00"), // 2330 ET on Feb 15th 2025
  totalClicks: 40192,
};

export const getLubStats = async () => {
  const publicClient = createPublicClient({
    chain: linea,
    transport: http(),
  });

  // Get total attributed clicks from contract
  const totalAttributed = await publicClient.readContract({
    address: CLICKER_ADDRESS[59144],
    abi: CLICKER_ABI,
    functionName: "totalAttributedClicks",
  });

  // Get remaining attributions
  const remaining = await publicClient.readContract({
    address: CLICKER_ADDRESS[59144],
    abi: CLICKER_ABI,
    functionName: "getRemainingAttributions",
  });

  // Get recent attribution events
  const logs = await publicClient.getLogs({
    address: CLICKER_ADDRESS[59144],
    event: parseAbiItem(
      "event ClicksAttributed(address indexed buyer, address indexed recipient, uint256 amount)"
    ),
    fromBlock: BigInt(0),
  });

  // Process logs to get unique addresses and their lub counts
  const lubHolders = new Map<string, bigint>();
  logs.forEach((log) => {
    const recipient = log.args.recipient as string;
    const amount = log.args.amount as bigint;
    lubHolders.set(
      recipient,
      (lubHolders.get(recipient) || BigInt(0)) + amount
    );
  });

  // Sort holders by amount and resolve identities
  const sortedHolders = Array.from(lubHolders.entries())
    .sort(([, a], [, b]) => (b - a > 0 ? 1 : -1))
    .slice(0, 5); // Top 5 holders

  // Resolve all identities in parallel
  const resolvedHolders = await Promise.all(
    sortedHolders.map(async ([address, amount]) => {
      const displayName = await resolveIdentity(address);
      return [displayName, amount] as [string, bigint];
    })
  );

  // Calculate ownership distribution
  const maxClicksNum = 69420;
  const offchainClicks = LAST_MANUAL_UPDATE.totalClicks;
  const onchainLubs = Number(totalAttributed);
  const totalProgress = offchainClicks + onchainLubs;
  const communityPercentage = (totalProgress / maxClicksNum) * 100;

  return `Lub Progress Update:
- Off-chain clicks (as of ${LAST_MANUAL_UPDATE.timestamp.toLocaleString()}): ${offchainClicks.toLocaleString()}
- On-chain lubs: ${onchainLubs.toLocaleString()}
- Total progress: ${totalProgress.toLocaleString()} / ${maxClicksNum.toLocaleString()} (${communityPercentage.toFixed(
    2
  )}%)
- Remaining lubs: ${Number(remaining).toLocaleString()}
- Price per lub: 0.0001 ETH
${
  resolvedHolders.length > 0
    ? `\nCurrent on-chain lub holders:\n${resolvedHolders
        .map(
          ([name, amount]) =>
            `- ${name}: ${amount.toString()} lub (${(
              (Number(amount) / maxClicksNum) *
              100
            ).toFixed(2)}%)`
        )
        .join("\n")}`
    : ""
}`;
};

export const getLubStatsMetadata = {
  name: "getLubStats",
  description:
    "Get current statistics about lub-u, including both off-chain and on-chain progress, total lubs, community ownership percentage, price per lub, and top holders with resolved identities.",
  schema: z.object({}),
};
