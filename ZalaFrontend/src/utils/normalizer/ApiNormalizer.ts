import {
  type AContact,
  type ALead,
  type IContact,
  type ILead,
  type ISourceResult,
  type IAddress,
  type AAddress,
  type ASourceResult,
  type ACampaign,
  type ICampaign,
  type ACampaignLead,
  type ICampaignLead,
  CampaignContactMethod,
  type ACampaignEmailSendResult,
  type ICampaignEmailSendResult,
  type ACampaignEmail,
  type ICampaignEmail,
  type ACampaignEmailCampaign,
  type ICampaignEmailCampaign,
  type ACampaignEmailLead,
  type ICampaignEmailLead,
  type ACampaignEmailContact,
  type ICampaignEmailContact,
} from "../../interfaces";

const contact = (data: AContact): IContact => {
  return {
    contactId: data["contact_id"],
    firstName: data["first_name"],
    lastName: data["last_name"],
    email: data["email"],
    phone: data["phone"],
  };
};

const address = (data: AAddress): IAddress => {
  return {
    addressId: data["address_id"],
    street1: data["street_1"],
    street2: data["street_2"],
    city: data["city"],
    state: data["state"],
    zipcode: data["zipcode"],
    lat: data["lat"],
    long: data["long"],
  };
};

const lead = (data: ALead): ILead => {
  return {
    leadId: data["lead_id"],
    licenseNum: data["license_num"],

    contact: contact(data["contact"]),
    address: address(data["address"]),

    buisness: data["business"], // Note: Typo on API side ?
    website: data["website"],
    notes: data["notes"],
    // properties: data["properties"],
    // campaigns: data["campaigns"],
  };
};

const sourceResult = <T, B>(
  data: ASourceResult<T>,
  result: B
): ISourceResult<B> => {
  return {
    ...result,
    distanceMiles: data["distance_miles"],
    // source: data["source"],
  };
};

const sourceLead = (d: ASourceResult<ALead>): ISourceResult<ILead> =>
  sourceResult<ALead, ILead>(d, lead(d));

const campaignLead = (data: ACampaignLead): ICampaignLead => {
  const contactMethods = [];
  if (data["email_contacted"]) contactMethods.push(CampaignContactMethod.Email);
  if (data["sms_contacted"]) contactMethods.push(CampaignContactMethod.SMS);
  if (data["phone_contacted"]) contactMethods.push(CampaignContactMethod.Phone);
  return {
    campaignId: data["campaign"]["campaign_id"],
    contactMethods: contactMethods,
    leadId: data["lead"]["lead_id"],
  };
};

const campaign = (data: ACampaign): ICampaign => {
  return {
    campaignId: data["campaign_id"],
    userId: data["user_id"],
    campaignName: data["campaign_name"],
    leads: data["leads"].map(campaignLead),
  };
};

const campaignEmailSendResult = (
  data: ACampaignEmailSendResult
): ICampaignEmailSendResult => ({
  leadId: data["lead_id"],
  messageId: data["message_id"] ?? -1,
  status: data["status"],
  toEmail: data["to_email"] ?? "",
  errorDetail: data["error_detail"] ?? null,
});

const campaignEmail = (data: ACampaignEmail): ICampaignEmail => ({
  messageId: data["message_id"],
  campaignId: data["campaign_id"],
  leadId: data["lead_id"] ?? -1,
  gmailMessageId: data["gmail_message_id"] ?? "",
  gmailThreadId: data["gmail_thread_id"] ?? "",
  sendStatus: data["send_status"],
  fromName: data["from_name"] ?? "",
  toEmail: data["to_email"] ?? "",
  messageSubject: data["message_subject"],
  messageBody: data["message_body"],
  errorDetail: data["error_detail"] ?? null,
  campaign: data["campaign"] ? campaignEmailCampaign(data["campaign"]) : null,
  lead: data["lead"] ? campaignEmailLead(data["lead"]) : null,
});

const campaignEmailCampaign = (
  data: ACampaignEmailCampaign
): ICampaignEmailCampaign => ({
  campaignId: data["campaign_id"],
  campaignName: data["campaign_name"] ?? "",
});

const campaignEmailLead = (data: ACampaignEmailLead): ICampaignEmailLead => ({
  contact: data["contact"] ? campaignEmailContact(data["contact"]) : null,
  leadId: data["lead_id"],
});

const campaignEmailContact = (
  data: ACampaignEmailContact
): ICampaignEmailContact => ({
  email: data["email"] ?? "",
  firstName: data["first_name"] ?? "",
  lastName: data["last_name"] ?? "",
});

export const APINormalizer = {
  lead,
  sourceLead,
  campaign,
  campaignEmail,
  campaignEmailSendResult,
};
