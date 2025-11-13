import type { ACampaign } from "./Campaign";

export type CampaignEmailStatus = "draft" | "sent" | "failed";

export type ACampaignEmailContact = {
  first_name?: string;
  last_name?: string;
  email?: string;
};

export type ICampaignEmailContact = {
  firstName: string;
  lastName: string;
  email: string;
};

export type ACampaignEmailLead = {
  lead_id: number;
  contact?: ACampaignEmailContact;
};

export type ICampaignEmailLead = {
  leadId: number;
  contact: ICampaignEmailContact | null;
};

export type ACampaignEmailCampaign = {
  campaign_id: number;
  campaign_name?: string;
};

export type ICampaignEmailCampaign = {
  campaignId: number;
  campaignName: string;
};

export type ACampaignEmail = {
  message_id: number;
  campaign_id: number;
  lead_id?: number | null;

  gmail_message_id?: string | null;
  gmail_thread_id?: string | null;

  send_status: CampaignEmailStatus;

  from_name?: string | null;
  to_email?: string | null;
  message_subject: string;
  message_body: string;
  error_detail?: string | null;
  campaign?: ACampaignEmailCampaign | null;
  lead?: ACampaignEmailLead | null;
  timestamp: string;
};

export type ICampaignEmail = {
  messageId: number;
  campaignId: number;
  leadId: number;

  gmailMessageId: string;
  gmailThreadId: string;

  sendStatus: CampaignEmailStatus;

  fromName: string;
  toEmail: string;
  messageSubject: string;
  messageBody: string;

  errorDetail: string | null;
  campaign: ICampaignEmailCampaign | null;
  lead: ICampaignEmailLead | null;
};

export type ACampaignEmailSendResult = {
  lead_id: number;
  message_id?: number | null;
  status: CampaignEmailStatus;
  to_email?: string | null;
  error_detail?: string | null;
};

export type ICampaignEmailSendResult = {
  leadId: number;
  messageId: number;
  toEmail: string;
  status: CampaignEmailStatus;
  errorDetail: string | null;
};

export type ACampaignEmailSendResponse = {
  campaign: ACampaign;
  results: ACampaignEmailSendResult[];
};
