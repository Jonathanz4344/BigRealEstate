import type {
  AContact,
  AUser,
  DemoData,
  DemoLocationResult,
} from "../../interfaces";
import type {
  CreateContactProps,
  CreateUserProps,
  LinkContactToUserProps,
  LoginAPIProps,
  LoginGoogleProps,
  SearchLeadsProps,
} from "./types";
import { useFetch } from "./useFetch";

export const useApi = () => {
  // const defaultResponse: APIResponse<unknown> = {
  //   data: null,
  //   err: "Method not implemented",
  // };
  const { post, get } = useFetch();

  const searchLeads = async ({ query, source }: SearchLeadsProps) => {
    return await post<{
      normalized_location: DemoLocationResult;
      nearby_properties: DemoData[];
    }>(`/api/search-location/`, {
      location_text: query,
      source,
    });
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
