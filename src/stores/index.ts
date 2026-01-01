import { create } from "zustand";
import { persist } from "zustand/middleware";
import persistStorage from "./persistStorage";

type Store = {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
};

export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      isLogin: false,
      setIsLogin: (isLogin: boolean) => set({ isLogin }),
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
