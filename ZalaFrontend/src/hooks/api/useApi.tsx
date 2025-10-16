import type { DemoData, DemoLocationResult } from "../../interfaces";
import type { SearchLeadsProps } from "./types";
import { useFetch } from "./useFetch";

export const useApi = () => {
  // const defaultResponse: APIResponse<unknown> = {
  //   data: null,
  //   err: "Method not implemented",
  // };
  const { post } = useFetch();

  const searchLeads = async ({ query, source }: SearchLeadsProps) => {
    return await post<{
      normalized_location: DemoLocationResult;
      nearby_properties: DemoData[];
    }>(`/api/search-location/`, {
      location_text: query,
      source,
    });
  };

  return {
    searchLeads,
  };
};
