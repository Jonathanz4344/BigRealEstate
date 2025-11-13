import { create } from "zustand";
import type { ILead, ISourceResult } from "../interfaces";

type ISearchQueryStore = {
  query: string;
  data: ISourceResult<ILead>[];
  loading: boolean;
  setData: (v: ISourceResult<ILead>[]) => void;
  setQuery: (v: string) => void;
  setLoading: (v: boolean) => void;
};

export const useSearchQueryStore = create<ISearchQueryStore>()((set) => ({
  query: "",
  data: [],
  loading: false,
  setData: (v: ISourceResult<ILead>[]) => set({ data: v }),
  setQuery: (v: string) => set({ query: v }),
  setLoading: (v: boolean) => set({ loading: v }),
}));
