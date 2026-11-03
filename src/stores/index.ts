import { create } from "zustand";
import { persist } from "zustand/middleware";
import persistStorage from "./persistStorage";

type Store = {
  isLogin: boolean;
  authReady: boolean;
  authRevision: number;
  setIsLogin: (isLogin: boolean) => void;
  setAuthReady: (authReady: boolean) => void;
};

export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      isLogin: false,
      authReady: false,
      authRevision: 0,
      setIsLogin: (isLogin: boolean) => set((state) => ({
        isLogin,
        authReady: true,
        authRevision: state.authRevision + 1,
      })),
      setAuthReady: (authReady: boolean) => set({ authReady }),
    }),
    {
      name: "app-storage",
      storage: persistStorage,
      partialize: (state) => ({
        isLogin: state.isLogin,
      }),
    }
  )
);
