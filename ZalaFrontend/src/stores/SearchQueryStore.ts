import { create } from "zustand";
import type { ILead, ISourceResult } from "../interfaces";

export type INearbyProperty = {
  propertyId: number;
  propertyName: string;
  address: {
    lat: number;
    long: number;
    street1: string;
    city: string;
    state: string;
    zipcode: string;
  };
  distanceMiles: number;
  source: "user_property";
};

type ISearchQueryStore = {
  query: string;
  data: ISourceResult<ILead>[];
  nearbyProperties: INearbyProperty[];
  loading: boolean;
  setData: (v: ISourceResult<ILead>[]) => void;
  setNearbyProperties: (v: INearbyProperty[]) => void;
  setQuery: (v: string) => void;
  setLoading: (v: boolean) => void;
};

export const useSearchQueryStore = create<ISearchQueryStore>()((set) => ({
  query: "",
  data: [],
  nearbyProperties: [],
  loading: false,
  setData: (v: ISourceResult<ILead>[]) => set({ data: v }),
  setNearbyProperties: (v: INearbyProperty[]) => set({ nearbyProperties: v }),
  setQuery: (v: string) => set({ query: v }),
  setLoading: (v: boolean) => set({ loading: v }),
}));
