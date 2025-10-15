import { create } from "zustand";
import type { DemoDataSource } from "../interfaces";

type ISearchFilterStore = {
  source: DemoDataSource;
  sortBy: string;
  setSortBy: (v: string) => void;
  setSource: (v: DemoDataSource) => void;
};

export const useSearchFilterStore = create<ISearchFilterStore>()((set) => ({
  source: "gpt",
  sortBy: "None",
  setSortBy: (v: string) => set({ sortBy: v }),
  setSource: (v: DemoDataSource) => set({ source: v }),
}));
