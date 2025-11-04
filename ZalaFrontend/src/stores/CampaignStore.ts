import { create } from "zustand";
import { DEFAULT_CAMPAIGN, type ICampaign } from "../interfaces";

type ICampaignStore = {
  campaign: ICampaign;
  setCampaign: (v: ICampaign) => void;
};

export const useCampaignStore = create<ICampaignStore>()((set) => ({
  campaign: DEFAULT_CAMPAIGN,
  setCampaign: (campaign) => set({ campaign }),
}));
