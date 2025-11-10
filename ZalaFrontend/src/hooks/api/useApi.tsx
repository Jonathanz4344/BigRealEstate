import type {
  AAddress,
  ACampaign,
  AContact,
  ALead,
  AUser,
  IAddress,
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
} from "./types";
import { useFetch } from "./useFetch";
import { DEFAULT_LEAD_SOURCES } from "../../stores";
import { Normalizer } from "../../utils";

export const useApi = () => {
  // const defaultResponse: APIResponse<unknown> = {
  //   data: null,
  //   err: "Method not implemented",
  // };
  const { post, get } = useFetch();

  const searchLeads = async ({ query, sources }: SearchLeadsProps) => {
    const requestedSources =
      sources.length > 0 ? sources : [...DEFAULT_LEAD_SOURCES];

    const response = await post<SearchLeadsResponse>(`/api/searchLeads`, {
      location_text: query,
      sources: requestedSources,
    });

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

  const createContact = async (body: CreateContactProps) => {
    return await post<AContact>(`/api/contacts`, body);
  };

  const createUser = async (body: CreateUserProps) => {
    return await post<AUser>(`/api/users/`, body);
  };

  const createAddress = async ({ address }: { address: IAddress }) => {
    return await post<AAddress>(`/api/addresses/`, {
      street_1: address.street1,
      street_2: address.street2,
      city: address.city,
      state: address.state,
      zipcode: address.zipcode,
      lat: address.lat,
      long: address.long,
    });
  };

  const linkContactToUser = async (body: LinkContactToUserProps) => {
    return await post<AUser>(
      `/api/users/${body.userId}/contacts/${body.contactId}`,
      {}
    );
  };

  const linkContactToLead = async ({
    leadId,
    contactId,
  }: {
    leadId: number;
    contactId: number;
  }) => {
    return await post<ALead>(`/api/leads/${leadId}/contacts/${contactId}`, {});
  };

  const linkAddressToLead = async ({
    leadId,
    addressId,
  }: {
    leadId: number;
    addressId: number;
  }) => {
    return await post<ALead>(`/api/leads/${leadId}/addresses/${addressId}`, {});
  };

  const linkUserToLead = async ({
    leadId,
    userId,
  }: {
    leadId: number;
    userId: number;
  }) => {
    return await post<ALead>(`/api/leads/${leadId}/users/${userId}`, {});
  };

  const loginAPI = async (body: LoginAPIProps) => {
    return await post<AUser>(`/api/login`, body);
  };

  const getUser = async (userId: string) => {
    return await get<AUser>(`/api/users/${userId}`);
  };

  const loginGoogle = async ({ token }: LoginGoogleProps) => {
    return await post<AUser>(`/api/login/google`, { id_token: token });
  };

  const createLead = async ({
    lead,
    createdById,
  }: CreateLeadProps): Promise<APIResponse<{ lead: ALead }>> => {
    const errorOut = (msg: string | null, backup: string) => {
      throw new Error(msg ?? backup);
    };

    const createData = async (): Promise<[ALead, AContact, AAddress]> => {
      const leadRes = await post<ALead>(`/api/leads`, {
        person_type: "person",
        business: lead.buisness,
        website: lead.website,
        license_num: lead.licenseNum,
        notes: lead.notes,
      });
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
    return await post<ACampaign>(`/api/campaigns/`, {
      campaign_name: title,
      user_id: userId,
      lead_ids: leads,
    });
  };

  return {
    searchLeads,
    createContact,
    createUser,
    linkContactToUser,
    loginAPI,
    getUser,
    loginGoogle,
    createCampaign,
    createLead,
  };
};
