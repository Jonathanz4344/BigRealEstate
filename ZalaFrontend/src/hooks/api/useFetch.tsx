import { CONFIG } from "../../config";
import type { APIResponse } from "./types";

const OK_STATUS_CODES = [200, 201, 202, 204];

export const useFetch = () => {
  const jsonHeader = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const formDataHeader = {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
  };

  const requestSuccess = <T,>(json: unknown): APIResponse<T> => ({
    data: json as T,
    err: null,
  });

  const requestError = <T,>(err: unknown): APIResponse<T> => ({
    data: null,
    err:
      typeof err === "string"
        ? err
        : err instanceof Error
        ? err.message
        : "Get request failed",
  });

  const fetchWithParams = async <T,>(
    apiEndpoint: string,
    method: "POST" | "GET" | "PUT" | "DELETE",
    body: unknown,
    isFormData: boolean = false,
    abortController = new AbortController()
  ): Promise<APIResponse<T>> => {
    const header = isFormData ? formDataHeader : jsonHeader;
    const url = CONFIG.api + apiEndpoint;

    try {
      const response = await fetch(url, {
        method,
        body:
          method !== "GET" && method !== "DELETE" && body
            ? JSON.stringify(body)
            : null,
        headers: header,
        signal: abortController.signal,
      });
      let parsed: any = null;
      const rawBody = await response.text();
      if (rawBody && rawBody.length > 0) {
        try {
          parsed = JSON.parse(rawBody);
        } catch {
          throw new Error("Invalid JSON response from API");
        }
      }

      if (
        !OK_STATUS_CODES.includes(response.status) ||
        (parsed && (parsed.err || parsed.error))
      )
        throw new Error(
          parsed?.err ?? parsed?.error ?? "Error communicating with API"
        );

      return requestSuccess<T>(parsed as T);
    } catch (err) {
      return requestError<T>(err);
    }
  };

  const get = async <T,>(
    apiEndpoint: string,
    abortController = new AbortController()
  ): Promise<APIResponse<T>> => {
    return await fetchWithParams(
      apiEndpoint,
      "GET",
      null,
      false,
      abortController
    );
  };

  const post = async <T,>(
    apiEndpoint: string,
    body: unknown,
    isFormData: boolean = false,
    abortController = new AbortController()
  ): Promise<APIResponse<T>> => {
    return await fetchWithParams(
      apiEndpoint,
      "POST",
      body,
      isFormData,
      abortController
    );
  };

  const put = async <T,>(
    apiEndpoint: string,
    body: unknown,
    isFormData: boolean = false,
    abortController = new AbortController()
  ): Promise<APIResponse<T>> => {
    return await fetchWithParams(
      apiEndpoint,
      "PUT",
      body,
      isFormData,
      abortController
    );
  };

  const del = async <T,>(
    apiEndpoint: string,
    abortController = new AbortController()
  ): Promise<APIResponse<T>> => {
    return await fetchWithParams(
      apiEndpoint,
      "DELETE",
      null,
      false,
      abortController
    );
  };

  return { get, post, put, del };
};
