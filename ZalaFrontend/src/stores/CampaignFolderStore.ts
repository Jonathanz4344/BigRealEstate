import { create } from "zustand";
import { CampaignTab } from "../interfaces";

export type ICampaignFolderStore = {
  tab: CampaignTab;
  setTab: (tab: CampaignTab) => void;
};

export const useCampaignFolderStore = create<ICampaignFolderStore>()((set) => ({
  tab: CampaignTab.Connect,
  setTab: (tab) => set({ tab }),
}));
