import { useTxLifecycle } from "./useTxLifecycle";
import { ClickLubRaidABI, CLICK_LUB_RAID_ADDRESS } from "@lub-u/abi";
import { useAccount, useChainId } from "wagmi";

const PRICE = BigInt(1e14); // 0.0001 ETH in wei

export function useRaid() {
  const { address } = useAccount();
  const chainId = useChainId();
  const tx = useTxLifecycle({ label: "Raid started!" });

  const startRaid = async (channelId: number, amount: number) => {
    if (!address) throw new Error("Connect wallet");
    const contract = {
      abi: ClickLubRaidABI as any,
      address: CLICK_LUB_RAID_ADDRESS[chainId] as `0x${string}`,
      functionName: "batchBuyAttribution",
      args: [channelId, BigInt(amount)],
      value: PRICE * BigInt(amount),
    };
    return tx.submit(contract);
  };

  return { ...tx, startRaid };
}