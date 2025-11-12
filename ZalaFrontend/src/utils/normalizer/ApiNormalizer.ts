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

export const APINormalizer = {
  lead,
  sourceLead,
  campaign,
};
