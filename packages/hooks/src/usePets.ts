import { useGetMyPetsQuery } from "@lub-u/data";
import { graphClient } from "@lub-u/data/src/client";
import { useAccount } from "wagmi";
import { useTxLifecycle } from "./useTxLifecycle";
import { HeartPetABI, HEART_PET_ADDRESS } from "@lub-u/abi";
import { useChainId } from "wagmi";

const PRICE = BigInt(1e14);

export function usePets() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { submit, isPending } = useTxLifecycle({ label: "Pet minted!" });

  const { data, isLoading } = useGetMyPetsQuery(graphClient, { owner: address as `0x${string}` }, { enabled: !!address });

  const mintPet = async () => {
    await submit({
      abi: HeartPetABI as any,
      address: HEART_PET_ADDRESS[chainId] as `0x${string}`,
      functionName: "mint",
      args: [],
      value: PRICE,
    });
  };

  return {
    pets: data?.pets ?? [],
    loading: isLoading || isPending,
    mintPet,
  };
}