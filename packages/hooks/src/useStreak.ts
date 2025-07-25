import { useGetLatestStreakQuery } from "@lub-u/data";
import { graphClient } from "@lub-u/data/src/client";
import { useAccount } from "wagmi";
import { useTxLifecycle } from "./useTxLifecycle";
import { ClickLubRaidABI, CLICK_LUB_RAID_ADDRESS } from "@lub-u/abi";
import { useChainId } from "wagmi";

export function useStreak() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data, isPending, submit } = useTxLifecycle({
    label: "Streak claimed!"
  });

  const { data: streakData, isLoading } = useGetLatestStreakQuery(graphClient, {
    user: address as `0x${string}`
  }, { enabled: !!address });

  // claimStreak triggers contract call
  const claimStreak = async () => {
    await submit({
      abi: ClickLubRaidABI as any,
      address: CLICK_LUB_RAID_ADDRESS[chainId] as `0x${string}`,
      functionName: "claimDailyStreak",
      args: []
    });
  };

  const streak = streakData?.dailyStreaks?.[0]?.streak ?? 0;
  const lastTimestamp = streakData?.dailyStreaks?.[0]?.timestamp ?? 0;

  return { streak, lastTimestamp, loading: isLoading || isPending, claimStreak };
}