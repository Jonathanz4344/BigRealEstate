import type { AContact, DemoDataSource } from "../../interfaces";

export type APIResponse<T> = {
  data: T | null;
  err: string | null;
};

export type SearchLeadsProps = {
  query: string;
  sources: DemoDataSource[];
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
};

export type SendTestEmailProps = {
  userId: number;
  to: string;
  subject: string;
  html: string;
  fromName?: string;
};
