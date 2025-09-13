import type { APIResponse } from "./types";
import { useFetch } from "./useFetch";

export const useApi = () => {
  const defaultResponse: APIResponse<unknown> = {
    data: null,
    err: "Method not implemented",
  };
  const { get } = useFetch();

  const getFourUp = async <T,>(): Promise<APIResponse<T>> => {
    return await get<T>("/some/api/url/endpoint");
  };

  const getAllFourUp = async <T,>(): Promise<APIResponse<T>> => {
    return defaultResponse as APIResponse<T>;
  };

  const createFourUp = async <T,>(): Promise<APIResponse<T>> => {
    return defaultResponse as APIResponse<T>;
  };

  const editFourUp = async <T,>(): Promise<APIResponse<T>> => {
    return defaultResponse as APIResponse<T>;
  };

  const getTrackedHours = async <T,>(): Promise<APIResponse<T>> => {
    return defaultResponse as APIResponse<T>;
  };

  const getAllTrackedHours = async <T,>(): Promise<APIResponse<T>> => {
    return defaultResponse as APIResponse<T>;
  };

  const createTrackedHours = async <T,>(): Promise<APIResponse<T>> => {
    return defaultResponse as APIResponse<T>;
  };

  const editTrackedHours = async <T,>(): Promise<APIResponse<T>> => {
    return defaultResponse as APIResponse<T>;
  };

  return {
    getFourUp,
    getAllFourUp,
    createFourUp,
    editFourUp,
    getTrackedHours,
    getAllTrackedHours,
    createTrackedHours,
    editTrackedHours,
  };
};
