import type { AContact, DemoDataSource, ILead } from "../../interfaces";

export type APIResponse<T> = {
  data: T | null;
  err: string | null;
};

export type SearchLeadsProps = {
  query: string;
  sources: DemoDataSource[];
};

export type SearchLeadsResponse = {
  requested_sources: string[];
  results: Record<string, never>;
  aggregated_leads: never[];
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
  token: string;
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
