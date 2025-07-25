import { sponsorUserOp } from "@lub-u/utils/src/paymasterClient";
import { showTxToast, showErrorToast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { writeContract, WriteContractParameters } from "wagmi/actions";
import { useAccount } from "wagmi";

const GASLESS_ENABLED = process.env.NEXT_PUBLIC_GASLESS_ENABLED === "true";

export function useWriteWithPaymaster() {
  const { chain } = useAccount();

  return useMutation(async (params: WriteContractParameters) => {
    try {
      let txHash: string;
      if (GASLESS_ENABLED) {
        // Placeholder: convert params to serialized tx string (stub)
        const userOp = JSON.stringify(params);
        txHash = await sponsorUserOp(userOp);
      } else {
        const res = await writeContract(params);
        txHash = res.hash as string;
      }
      showTxToast(txHash);
      return txHash;
    } catch (err: any) {
      showErrorToast(err.message ?? "Tx failed");
      throw err;
    }
  });
}