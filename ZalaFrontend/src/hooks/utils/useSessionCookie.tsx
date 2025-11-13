import { ReactSession } from "react-client-session";

type CookieNames = "userId";

export const useSessionCookie = (): [
  (cookieName?: "userId") => string | undefined,
  (cookieName: "userId", value: string) => string | undefined
] => {
  ReactSession.setStoreType("localStorage");

  const getCookie = (cookieName: CookieNames = "userId") =>
    ReactSession.get(cookieName);

  const setCookie = (cookieName: CookieNames, value: string) =>
    ReactSession.set(cookieName, value);

  return [getCookie, setCookie];
};
