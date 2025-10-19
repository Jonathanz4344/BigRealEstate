import { create } from "zustand";
import type { DemoData } from "../interfaces";

type ISearchQueryStore = {
  query: string;
  data: DemoData[];
  setData: (v: DemoData[]) => void;
  setQuery: (v: string) => void;
};

export const useSearchQueryStore = create<ISearchQueryStore>()((set) => ({
  query: "",
  data: [],
  setData: (v: DemoData[]) => set({ data: v }),
  setQuery: (v: string) => set({ query: v }),
}));
