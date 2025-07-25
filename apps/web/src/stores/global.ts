import { create } from "zustand";
import { useEffect } from "react";

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
  theme: typeof window !== "undefined" && localStorage.theme
    ? (localStorage.theme as "light" | "dark")
    : "light",
  toggleTheme: () => set((s) => {
    const next = s.theme === "light" ? "dark" : "light";
    if (typeof window !== "undefined") localStorage.theme = next;
    return { theme: next };
  }),
  openModal: null,
  setModal: (openModal) => set({ openModal }),
}));

// For hydration, use in _app/layout or as effect in ThemeToggle if needed
export function useThemeHydration() {
  const { theme, toggleTheme } = useGlobalStore();
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.theme && localStorage.theme !== theme) {
      toggleTheme();
    }
    // eslint-disable-next-line
  }, []);
}