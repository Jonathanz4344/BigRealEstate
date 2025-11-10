import { create } from "zustand";
import type { DemoData } from "../interfaces";

type ISearchQueryStore = {
  query: string;
  data: DemoData[];
  loading: boolean;
  setData: (v: DemoData[]) => void;
  setQuery: (v: string) => void;
  setLoading: (v: boolean) => void;
};

export const useSearchQueryStore = create<ISearchQueryStore>()((set) => ({
  query: "",
  data: [],
  loading: false,
  setData: (v: DemoData[]) => set({ data: v }),
  setQuery: (v: string) => set({ query: v }),
  setLoading: (v: boolean) => set({ loading: v }),
}));
