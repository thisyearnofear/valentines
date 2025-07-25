import { useWriteWithPaymaster } from "./useWriteWithPaymaster";
import { waitForTransaction } from "wagmi/actions";
import { showTxToast, showSuccessToast, showErrorToast } from "@/lib/toast";

export function useTxLifecycle({ label = "Transaction confirmed" }: { label?: string } = {}) {
  const mutation = useWriteWithPaymaster();

  const submit = async (params: any) => {
    try {
      const hash = await mutation.mutateAsync(params);
      showTxToast(hash);
      const res = await waitForTransaction({ hash });
      if (res.status === "success") {
        showSuccessToast(label);
      } else {
        showErrorToast("Transaction reverted");
      }
      return hash;
    } catch (err: any) {
      showErrorToast(err.message ?? "Tx failed");
      throw err;
    }
  };

  return { ...mutation, submit };
}