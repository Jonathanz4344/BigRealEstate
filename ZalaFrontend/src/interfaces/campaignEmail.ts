export type CampaignEmailStatus = "draft" | "sent" | "failed";

export type ACampaignEmailContact = {
  first_name?: string;
  last_name?: string;
  email?: string;
};

export type ACampaignEmailLead = {
  lead_id: number;
  contact?: ACampaignEmailContact;
};

export type ACampaignEmailCampaign = {
  campaign_id: number;
  campaign_name?: string;
};

export type ACampaignEmail = {
  message_id: number;
  campaign_id: number;
  lead_id?: number | null;
  message_subject: string;
  message_body: string;
  from_name?: string | null;
  timestamp: string;
  to_email?: string | null;
  gmail_message_id?: string | null;
  gmail_thread_id?: string | null;
  send_status: CampaignEmailStatus;
  error_detail?: string | null;
  campaign?: ACampaignEmailCampaign | null;
  lead?: ACampaignEmailLead | null;
};

export type ACampaignEmailSendResult = {
  lead_id: number;
  to_email?: string | null;
  status: CampaignEmailStatus;
  error_detail?: string | null;
  message_id?: number | null;
};

export type ACampaignEmailSendResponse = {
  campaign: ACampaignEmailCampaign & Record<string, unknown>;
  results: ACampaignEmailSendResult[];
};
