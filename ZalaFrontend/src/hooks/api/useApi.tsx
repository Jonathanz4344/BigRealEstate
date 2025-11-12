import {
  CampaignContactMethod,
  type AAddress,
  type ACampaign,
  type ACampaignLead,
  type AContact,
  type ALead,
  type AUser,
  type IAddress,
} from "../../interfaces";
import type {
  APIResponse,
  CreateCampaignProps,
  CreateContactProps,
  CreateLeadProps,
  CreateUserProps,
  LinkContactToUserProps,
  LoginAPIProps,
  LoginGoogleProps,
  SearchLeadsProps,
  SearchLeadsResponse,
  UpdateCampaignLeadProps,
  UpdateLeadProps,
} from "./types";
import { useFetch } from "./useFetch";
import { DEFAULT_LEAD_SOURCES } from "../../stores";
import { Normalizer } from "../../utils";
import { useState } from "react";
import { useApiResponseError } from "../utils";

export const useApi = () => {
  // const defaultResponse: APIResponse<unknown> = {
  //   data: null,
  //   err: "Method not implemented",
  // };

  const apiResponseError = useApiResponseError();
  const { post, get, put } = useFetch();
  const [signal, setSignalState] = useState<AbortSignal>(
    new AbortController().signal
  );
  const [signalTo, setSignalTo] = useState<string[]>([]);

  const setSignal = (signal: AbortSignal, attatchTo: string[]) => {
    setSignalState(signal);
    setSignalTo(attatchTo);
  };

  const getSignal = (from: string) => {
    if (!signalTo.includes(from)) return new AbortController().signal;
    return signal;
  };

  const idsToQueryString = (
    ids: (string | number)[],
    prefix: string = "id"
  ) => {
    let string = "";
    for (let i = 0; i < ids.length; i++) {
      if (i === 0) string += `${prefix}=${ids[i]}`;
      else string += `&${prefix}=${ids[i]}`;
    }
    return string;
  };

  const createContact = async (body: CreateContactProps) => {
    return await post<AContact>(`/api/contacts`, body, {
      isFormData: false,
      signal: getSignal("createContact"),
    });
  };

  const createUser = async (body: CreateUserProps) => {
    return await post<AUser>(`/api/users/`, body, {
      isFormData: false,
      signal: getSignal("createUser"),
    });
  };

  const createAddress = async ({ address }: { address: IAddress }) => {
    return await post<AAddress>(
      `/api/addresses/`,
      {
        street_1: address.street1,
        street_2: address.street2,
        city: address.city,
        state: address.state,
        zipcode: address.zipcode,
        lat: address.lat,
        long: address.long,
      },
      { isFormData: false, signal: getSignal("createAddress") }
    );
  };

  const createLead = async ({
    lead,
    createdById: _userId,
  }: CreateLeadProps): Promise<APIResponse<{ lead: ALead }>> => {
    const errorOut = (msg: string | null, backup: string) => {
      throw new Error(msg ?? backup);
    };

    const createData = async (): Promise<[ALead, AContact, AAddress]> => {
      const leadRes = await post<ALead>(
        `/api/leads`,
        {
          person_type: "person",
          business: lead.buisness,
          website: lead.website,
          license_num: lead.licenseNum,
          notes: lead.notes,
        },
        { isFormData: false, signal: getSignal("createData") }
      );
      if (leadRes.err || !leadRes.data)
        return errorOut(leadRes.err, "Creating lead api failed");
      const apiLead = leadRes.data;

      const contactRes = await createContact({
        ...lead.contact,
        first_name: lead.contact.firstName,
        last_name: lead.contact.lastName,
      });
      if (contactRes.err || !contactRes.data)
        return errorOut(contactRes.err, "Creating contact api failed");
      const apiContact = contactRes.data;

      const addressRes = await createAddress({ address: lead.address });
      if (addressRes.err || !addressRes.data)
        return errorOut(addressRes.err, "Creating address api failed");
      const apiAddress = addressRes.data;

      return [apiLead, apiContact, apiAddress];
    };

    const connectData = async ([apiLead, apiContact, apiAddress]: [
      ALead,
      AContact,
      AAddress
    ]) => {
      const contactRes = await linkContactToLead({
        leadId: apiLead.lead_id,
        contactId: apiContact.contact_id,
      });
      if (contactRes.err || !contactRes.data)
        return errorOut(contactRes.err, "Contact link to lead api failed");

      const addressRes = await linkAddressToLead({
        leadId: apiLead.lead_id,
        addressId: apiAddress.address_id,
      });
      if (addressRes.err || !addressRes.data)
        return errorOut(addressRes.err, "Address link to lead api failed");

      // const userRes = await linkUserToLead({
      //   leadId: apiLead.lead_id,
      //   userId: createdById,
      // });
      // if (userRes.err || !userRes.data)
      //   return errorOut(contactRes.err, "User link to lead api failed");

      return addressRes.data;
    };

    try {
      const createdParts = await createData();
      const createdLead = await connectData(createdParts);
      return { data: { lead: createdLead }, err: null };
    } catch (e) {
      if (e instanceof Error) return { err: e.message, data: null };
      if (typeof e === "string") return { err: e, data: null };
      return { err: "Internal error creating lead", data: null };
    }
  };

  const createCampaign = async ({
    title,
    leads,
    userId,
  }: CreateCampaignProps) => {
    return await post<ACampaign>(
      `/api/campaigns/`,
      {
        campaign_name: title,
        user_id: userId,
        lead_ids: leads,
      },
      { isFormData: false, signal: getSignal("createCampaign") }
    );
  };

  const linkContactToUser = async (body: LinkContactToUserProps) => {
    return await post<AUser>(
      `/api/users/${body.userId}/contacts/${body.contactId}`,
      {},
      { isFormData: false, signal: getSignal("linkContactToUser") }
    );
  };

  const linkContactToLead = async ({
    leadId,
    contactId,
  }: {
    leadId: number;
    contactId: number;
  }) => {
    return await post<ALead>(
      `/api/leads/${leadId}/contacts/${contactId}`,
      {},
      { isFormData: false, signal: getSignal("linkContactToLead") }
    );
  };

  const linkAddressToLead = async ({
    leadId,
    addressId,
  }: {
    leadId: number;
    addressId: number;
  }) => {
    return await post<ALead>(
      `/api/leads/${leadId}/addresses/${addressId}`,
      {},
      { isFormData: false, signal: getSignal("linkAddressToLead") }
    );
  };

  const linkUserToLead = async ({
    leadId,
    userId,
  }: {
    leadId: number;
    userId: number;
  }) => {
    return await post<ALead>(
      `/api/leads/${leadId}/users/${userId}`,
      {},
      { isFormData: false, signal: getSignal("linkUserToLead") }
    );
  };

  const updateCampaign = async ({
    title,
    leads,
    userId,
    campaignId,
  }: CreateCampaignProps & { campaignId: number }) => {
    return await put<ACampaign>(
      `/api/campaigns/${campaignId}`,
      {
        campaign_name: title,
        user_id: userId,
        lead_ids: leads,
      },
      { isFormData: false, signal: getSignal("updateCampaign") }
    );
  };

  const updateLead = async ({
    userId: _userId,
    buisness,
    leadId,
    licenseNumber,
    notes,
    website,
  }: UpdateLeadProps) => {
    return await put<ALead>(
      `/api/leads/${leadId}`,
      {
        person_type: "person",
        business: buisness,
        notes,
        license_num: licenseNumber,
        website,
      },
      { signal: getSignal("updateLead"), isFormData: false }
    );
  };

  const updateCampaignLead = async ({
    campaignId,
    leadId,
    userId: _userId,
    contactMethods,
  }: UpdateCampaignLeadProps) => {
    return await put<ACampaignLead>(
      `/api/campaign-leads/${campaignId}/leads/${leadId}`,
      {
        phone_contacted: contactMethods.includes(CampaignContactMethod.Phone),
        sms_contacted: contactMethods.includes(CampaignContactMethod.SMS),
        email_contacted: contactMethods.includes(CampaignContactMethod.Email),
      }
    );
  };

  const getUser = async (userId: string) => {
    return await get<AUser>(`/api/users/${userId}`, getSignal("getUser"));
  };

  const getCampaign = async (
    campaignId: number | string,
    _userId: number | string
  ) => {
    return await get<ACampaign>(
      `/api/campaigns/${campaignId}`,
      getSignal("getCampaign")
    );
  };

  const getLeads = async (leadIds: number[], _userId: number | string) => {
    return await get<ALead[]>(
      `/api/leads?${idsToQueryString(leadIds, "lead_ids")}`,
      getSignal("getLeads")
    );
  };

  const getLead = async (leadId: number, _userId: number) => {
    return await get<ALead>(`/api/leads/${leadId}`, getSignal("getLead"));
  };

  const loginGoogle = async ({ token }: LoginGoogleProps) => {
    return await post<AUser>(
      `/api/login/google`,
      { id_token: token },
      { isFormData: false, signal: getSignal("loginGoogle") }
    );
  };

  const loginAPI = async (body: LoginAPIProps) => {
    return await post<AUser>(`/api/login`, body, {
      isFormData: false,
      signal: getSignal("loginAPI"),
    });
  };

  const searchLeads = async ({ query, sources }: SearchLeadsProps) => {
    const requestedSources =
      sources.length > 0 ? sources : [...DEFAULT_LEAD_SOURCES];

    const response = await post<SearchLeadsResponse>(
      `/api/searchLeads`,
      {
        location_text: query,
        sources: requestedSources,
      },
      { isFormData: false, signal: getSignal("searchLeads") }
    );

    if (response.err || !response.data) {
      return {
        data: null,
        err: response.err ?? "No data returned",
      };
    }

    return {
      data: {
        nearby_properties: response.data.aggregated_leads.map(
          Normalizer.APINormalizer.sourceLead
        ),
      },
      err: null,
    };
  };

  return {
    apiResponseError,
    searchLeads,
    createContact,
    createUser,
    linkContactToUser,
    loginAPI,
    getUser,
    getCampaign,
    getLeads,
    loginGoogle,
    createCampaign,
    createLead,
    updateCampaign,
    updateLead,
    setSignal,
    updateCampaignLead,
    getLead,
    linkUserToLead,
  };
};
