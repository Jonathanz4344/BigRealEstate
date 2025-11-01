import { create } from "zustand";

export enum SideNavControlVariant {
  LeadFilters = "LeadFilters",
  None = "None",
}

type ISideNavControlStore = {
  isOpen: boolean;
  variant: SideNavControlVariant;
  timeout: number | undefined;

  open: (variant: SideNavControlVariant) => void;
  close: () => void;
};

export const useSideNavControlStore = create<ISideNavControlStore>()(
  (set, vals) => ({
    isOpen: false,
    variant: SideNavControlVariant.None,
    timeout: undefined,

    open: (variant) => set({ isOpen: true, variant }),
    close: () => {
      const currVals = vals();
      if (currVals.timeout) clearTimeout(currVals.timeout);
      const timeout = setTimeout(() => {
        set({ variant: SideNavControlVariant.None, timeout: undefined });
      }, 500);
      set({ isOpen: false, timeout });
    },
  })
);
