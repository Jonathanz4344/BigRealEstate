import type { DemoData } from "./DemoData";

export type ICampaign = {
  campaignId: number;
  leads: DemoData[];
};

export type ACampaignSummary = {
  campaign_id: number;
  campaign_name: string;
  user_id?: number | null;
};

export const DEFAULT_CAMPAIGN: ICampaign = {
  campaignId: -1,
  leads: [],
};
