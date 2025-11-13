import type { ICampaign } from "../interfaces";

const DEFAULT_CAMPAIGN: ICampaign = {
  campaignId: 0,
  userId: 0,
  campaignName: "",
  leads: [],
};

export const DEFAULTS = {
  campaign: DEFAULT_CAMPAIGN,
};
