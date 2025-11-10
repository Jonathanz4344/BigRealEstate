import type { AContact, AUser } from "../../interfaces";
import type {
  CreateContactProps,
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
        nearby_properties: response.data.aggregated_leads.map((d) =>
          Normalizer.APINormalizer.sourceResult(
            d,
            Normalizer.APINormalizer.lead(d)
          )
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

  const linkContactToUser = async (body: LinkContactToUserProps) => {
    return await post<AUser>(
      `/api/users/${body.userId}/contacts/${body.contactId}`,
      {}
    );
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

  return {
    searchLeads,
    createContact,
    createUser,
    linkContactToUser,
    loginAPI,
    getUser,
    loginGoogle,
  };
};
