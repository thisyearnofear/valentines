import { create } from "zustand";

interface GlobalState {
  walletConnected: boolean;
  setWalletConnected: (connected: boolean) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  openModal: string | null;
  setModal: (id: string | null) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  walletConnected: false,
  setWalletConnected: (walletConnected) => set({ walletConnected }),
  theme: "light",
  toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
  openModal: null,
  setModal: (openModal) => set({ openModal }),
}));