import type { DemoData } from "./DemoData";
import type { ILead } from "./Lead";

export type ICampaign = {
  campaignId: number;
  leads: ILead[];
};

export const DEFAULT_CAMPAIGN: ICampaign = {
  campaignId: -1,
  leads: [],
};
