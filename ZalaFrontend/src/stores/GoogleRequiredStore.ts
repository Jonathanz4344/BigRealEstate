import { create } from "zustand";

type IGoogleRequiredStore = {
  showGoogleRequired: boolean;
  setShowGoogleRequired: (v: boolean) => void;
};

export const useGoogleRequiredStore = create<IGoogleRequiredStore>()((set) => ({
  showGoogleRequired: false,
  setShowGoogleRequired: (showGoogleRequired) => set({ showGoogleRequired }),
}));
