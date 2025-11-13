import type { AUser, IUser } from "./User";

export enum CampaignContactMethod {
  Phone = "phone",
  SMS = "sms",
  Email = "email",
}

export type ACampaignLead = {
  phone_contacted: boolean;
  sms_contacted: boolean;
  email_contacted: boolean;
  campaign: {
    campaign_id: number;
    campaign_name: string;
  };
  lead: {
    lead_id: number;
    person_type: "person" | "business";
  };
};

export type ACampaign = {
  campaign_name: string;
  user_id: number;
  campaign_id: number;
  user: AUser;
  leads: ACampaignLead[]; // define separately if leads have structure
};

export type ICampaignLead = {
  leadId: number;
  campaignId: number;

  contactMethods: string[];
};

export type ICampaign = {
  campaignId: number;
  userId: number;

  user?: IUser;

  campaignName: string;
  leads: ICampaignLead[];
};

export type ACampaignSummary = {
  campaign_id: number;
  campaign_name: string;
  user_id?: number | null;
};

export const DEFAULT_CAMPAIGN: ICampaign = {
  campaignId: -1,
  userId: -1,

  campaignName: "",
  leads: [],
};
