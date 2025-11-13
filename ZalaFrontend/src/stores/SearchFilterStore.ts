import { create } from "zustand";

type ISearchFilterStore = {
  sortBy: string;
  setSortBy: (v: string) => void;
};

export const useSearchFilterStore = create<ISearchFilterStore>()((set) => ({
  sortBy: "None",
  setSortBy: (v: string) => set({ sortBy: v }),
}));
