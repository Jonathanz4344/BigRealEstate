import type { AContact } from "../../interfaces";

export type APIResponse<T> = {
  data: T | null;
  err: string | null;
};

export type SearchLeadsProps = {
  query: string;
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
