import { toast } from "sonner";
export const showTxToast = (hash: string) =>
  toast.info("Transaction submitted", { description: hash });
export const showSuccessToast = (msg: string) => toast.success(msg);
export const showErrorToast = (msg: string) => toast.error(msg);