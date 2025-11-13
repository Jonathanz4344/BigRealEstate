import type { AContact, ILead } from "../../interfaces";

export type APIResponse<T> = {
  data: T | null;
  err: string | null;
};

export type SearchLeadsProps = {
  query: string;
};

export type SearchLeadsResponse = {
  aggregated_leads: never[];
  external_persistence?: Record<string, unknown>;
  errors?: Record<string, string>;
};

export type CreateContactProps = Omit<AContact, "contact_id">;

export type CreateUserProps = {
  username: string;
  profile_pic: string;
  role: string;
  password: string;
};

export type LinkContactToUserProps = {
  userId: number;
  contactId: number;
};

export type LoginAPIProps = {
  username: string;
  password: string;
};

export type LoginGoogleProps = {
  code: string;
  scope?: string;
  targetUserId?: number;
};

export type SendTestEmailProps = {
  userId: number;
  to: string;
  subject: string;
  html: string;
  fromName?: string;
};

export type CreateCampaignEmailDraftProps = {
  campaignId: number;
  subject: string;
  body: string;
  leadId?: number;
  fromName?: string;
};

export type SendCampaignEmailProps = {
  campaignId: number;
  leadIds: number[];
  subject: string;
  body: string;
  fromName?: string;
};

export type CampaignEmailQueryParams = {
  campaignId?: number;
  skip?: number;
  limit?: number;
};

export type UpdateCampaignEmailDraftProps = {
  messageId: number;
  subject?: string;
  body?: string;
  fromName?: string;
  leadId?: number | null;
};

export type DeleteCampaignEmailDraftProps = {
  messageId: number;
};

export type ListCampaignsParams = {
  skip?: number;
  limit?: number;
};

export type CreateCampaignProps = {
  title: string;
  userId: number;
  leads: number[];
};

export type CreateLeadProps = {
  lead: ILead;
  createdById: number;
};

export type UpdateLeadProps = {
  leadId: number;
  userId: number;
  buisness: string;
  website: string;
  licenseNumber: string;
  notes: string;
};

export type UpdateCampaignLeadProps = {
  campaignId: number;
  leadId: number;
  userId: number;
  contactMethods: string[];
};
