import { CONFIG } from "../../config";
import type { APIResponse } from "./types";

const OK_STATUS_CODES = [200, 201, 202, 204];

type RequestOptions = {
  isFormData?: boolean;
  signal?: AbortSignal;
};

export const useFetch = () => {
  const defaultHeaders = {
    Accept: "application/json",
  } as Record<string, string>;

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
          : "Request failed",
  });

  const fetchWithParams = async <T,>(
    apiEndpoint: string,
    method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH",
    body: unknown,
    { signal, isFormData }: RequestOptions = {},
  ): Promise<APIResponse<T>> => {
    const url = CONFIG.api + apiEndpoint;
    const abortSignal = signal ?? new AbortController().signal;

    try {
      const headers: Record<string, string> = { ...defaultHeaders };
      let bodyToSend: BodyInit | null = null;

      if (method !== "GET" && method !== "DELETE" && body != null) {
        if (isFormData) {
          if (body instanceof FormData) {
            bodyToSend = body;
          } else {
            throw new Error("Form data body must be an instance of FormData");
          }
        } else {
          headers["Content-Type"] = "application/json";
          bodyToSend = JSON.stringify(body);
        }
      }

      const response = await fetch(url, {
        method,
        body: bodyToSend,
        headers,
        signal: abortSignal,
      });

      const rawBody = await response.text();
      let parsed: unknown = null;
      if (rawBody && rawBody.length > 0) {
        try {
          parsed = JSON.parse(rawBody);
        } catch {
          throw new Error("Invalid JSON response from API");
        }
      }

      if (
        !OK_STATUS_CODES.includes(response.status) ||
        (parsed &&
          typeof parsed === "object" &&
          ((parsed as Record<string, unknown>).err ||
            (parsed as Record<string, unknown>).error))
      ) {
        const errorObj = parsed as Record<string, unknown> | null;
        // FastAPI returns errors with "detail" key, also check for "err" and "error"
        throw new Error(
          (errorObj?.detail as string) ??
            (errorObj?.err as string) ??
            (errorObj?.error as string) ??
            (errorObj?.err as string) ??
            (errorObj?.error as string) ??
            (errorObj?.detail as string) ??
            "Error communicating with API",
        );
      }

      return requestSuccess<T>(parsed as T);
    } catch (err) {
      return requestError<T>(err);
    }
  };

  const get = async <T,>(
    apiEndpoint: string,
    signal?: AbortSignal,
  ): Promise<APIResponse<T>> => {
    return await fetchWithParams<T>(apiEndpoint, "GET", null, {
      isFormData: false,
      signal,
    });
  };

  const post = async <T,>(
    apiEndpoint: string,
    body: unknown,
    options: RequestOptions = {},
  ): Promise<APIResponse<T>> => {
    return await fetchWithParams<T>(apiEndpoint, "POST", body, options);
  };

  const put = async <T,>(
    apiEndpoint: string,
    body: unknown,
    options: RequestOptions = {},
  ): Promise<APIResponse<T>> => {
    return await fetchWithParams<T>(apiEndpoint, "PUT", body, options);
  };

  const del = async <T,>(
    apiEndpoint: string,
    signal?: AbortSignal,
  ): Promise<APIResponse<T>> => {
    return await fetchWithParams<T>(apiEndpoint, "DELETE", null, {
      isFormData: false,
      signal,
    });
  };

  const patch = async <T,>(
    apiEndpoint: string,
    body: unknown,
    options: RequestOptions = {},
  ): Promise<APIResponse<T>> => {
    return await fetchWithParams<T>(apiEndpoint, "PATCH", body, options);
  };

  return { get, post, put, del, patch };
};
