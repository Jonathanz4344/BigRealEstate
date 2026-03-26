import type { AContact, IContact, ILead } from "../../interfaces";

export type APIHookProps = {
  signal: AbortSignal;
  getSignal: (val: string) => AbortSignal;
  idsToQueryString: (ids: (string | number)[], prefix?: string) => string;
};

export type APIResponse<T> = {
  data: T | null;
  err: string | null;
};

export type SearchLeadsProps = {
  query: string;
};

export type ANearbyProperty = {
  property_id: number;
  property_name: string | null;
  mls_number: string | null;
  notes: string | null;
  image_url: string | null;
  address_id: number;
  address: {
    address_id: number;
    street_1: string;
    street_2: string | null;
    city: string;
    state: string;
    zipcode: string;
    lat: number;
    long: number;
  };
  distance_miles: number;
  source: "user_property";
};

export type SearchLeadsResponse = {
  aggregated_leads: never[];
  nearby_properties?: ANearbyProperty[];
  external_persistence?: Record<string, unknown>;
  errors?: Record<string, string>;
};

export type CreateContactProps = Omit<AContact, "contact_id">;

export type EditContactProps = {
  newContact: Partial<IContact> & { contactId: number };
  ogContact: IContact;
};

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
  createdById: number;
  newLead: Partial<ILead> & { leadId: number };
  ogLead: ILead;
};

export type UpdateCampaignLeadProps = {
  campaignId: number;
  leadId: number;
  userId: number;
  contactMethods: string[];
};

export type SendVerificationCodeProps = {
  email: string;
};

export type SendVerificationCodeResponse = {
  message: string;
  email: string;
};

export type VerifyCodeProps = {
  email: string;
  code: string;
};

export type VerifyCodeResponse = {
  verified: boolean;
  message: string;
};

// Gmail Signature
export type GmailSignatureResponse = {
  signature: string;
  send_as_email: string;
};

export type CreateBoardProps = {
  boardName: string;
  userId: number;
};

export type CreateBoardStepProps = {
  boardId: number;
  boardColumn: number;
  stepName: string;
};

export type UpdateBoardProps = CreateBoardProps & {
  boardId: number;
  boardType: string;
};

export type CreateManualLeadProps = {
  business: string;
  personType: string;
  website: string;
  licenseNum: string;
  notes: string;
};

type CreateImageProps = {
  file: File;
  gallery?: boolean;
  sortOrder?: string;
  caption?: string;
};

export type CreateLeadImageProps = CreateImageProps & {
  leadId: number;
};

export type CreatePropertyImageProps = CreateImageProps & {
  propertyId: number;
  addressId: number;
};

// SMTP Types
export type SMTPSendRequest = {
  to_email: string;
  name: string;
  subject: string;
  body: string;
};

export type SMTPSendResponse = {
  success: boolean;
  message: string;
};

export type SMTPConfigResponse = {
  configured: boolean;
  host: string | null;
  port: number;
};

// Team Types

export type CreateTeamRequest = {
  team_name: string;
  admin_user_id: number;
};

export type UpdateTeamNameRequest = {
  team_id: number;
  team_name: string;
  xp: number;
};

export type InviteToTeamRequest = {
  team_id: number;
  sender_id: number;
  recipient_email: string;
};

export type RespondToInvitationRequest = {
  invitation_id: number;
  accept: boolean;
  user_id: number;
};

export type CreateAnnouncementRequest = {
  team_id: number;
  author_id: number;
  title: string;
  message: string;
};

export type UpdateAnnouncementRequest = {
  team_id: number;
  announcement_id: number;
  user_id: number;
  title?: string;
  message?: string;
};

export type CloseTeamDealProps = {
  teamId: number;
  propertyId: number;
  user_id: number;
  lead_id: number | null;
  sale_price: number;
  notes: string;
  closed_at: string;
};
