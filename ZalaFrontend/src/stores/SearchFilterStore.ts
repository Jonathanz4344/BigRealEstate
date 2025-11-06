import { create } from "zustand";
import type { DemoDataSource } from "../interfaces";

type ISearchFilterStore = {
  sources: DemoDataSource[];
  sortBy: string;
  setSortBy: (v: string) => void;
  setSources: (v: DemoDataSource[]) => void;
};

export const DEFAULT_LEAD_SOURCES: DemoDataSource[] = ["google_places"];

export const useSearchFilterStore = create<ISearchFilterStore>()((set) => ({
  sources: [...DEFAULT_LEAD_SOURCES],
  sortBy: "None",
  setSortBy: (v: string) => set({ sortBy: v }),
  setSources: (v: DemoDataSource[]) =>
    set({
      sources: v.length > 0 ? [...new Set(v)] : [...DEFAULT_LEAD_SOURCES],
    }),
}));
