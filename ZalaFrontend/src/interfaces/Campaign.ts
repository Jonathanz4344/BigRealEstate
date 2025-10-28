import type { DemoData } from "./DemoData";

export type ICampaign = {
  campaignId: number;
  leads: DemoData[];
};

export const DEFAULT_CAMPAIGN: ICampaign = {
  campaignId: -1,
  leads: [],
};
