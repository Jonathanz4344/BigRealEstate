import { create } from "zustand";
import { CampaignTab } from "../interfaces";

type ICampaignPageStore = {
  tab: CampaignTab;
  setTab: (tab: CampaignTab) => void;

  viewingLead: number;
  setViewingLead: (viewingLead: number) => void;

  selectedLeads: number[];
  setSelectedLeads: (selectedLeads: number[]) => void;

  notes: string;
  setNotes: (v: string) => void;
};

export const useCampaignPageStore = create<ICampaignPageStore>()((set) => ({
  tab: CampaignTab.Connect,
  setTab: (tab) => set({ tab }),

  viewingLead: -1,
  setViewingLead: (viewingLead) => set({ viewingLead }),

  selectedLeads: [],
  setSelectedLeads: (selectedLeads) => set({ selectedLeads }),

  notes: "",
  setNotes: (notes: string) => set({ notes }),
}));
