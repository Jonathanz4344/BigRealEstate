import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIG } from "../../../config";
import { useApi } from "../../api";
import { stringify } from "../../../utils";
import { AUserToIUser, type IUser } from "../../../interfaces";

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initCodeClient: (config: GoogleCodeClientConfig) => GoogleCodeClient;
        };
      };
    };
  }
}

type GoogleCodeClient = {
  requestCode: () => void;
};

type GoogleCodeClientConfig = {
  client_id: string;
  scope: string;
  ux_mode?: "popup" | "redirect";
  redirect_uri: string;
  prompt?: string;
  access_type?: "online" | "offline";
  callback: (response: GoogleCodeResponse) => void;
  error_callback?: (error: GoogleCodeError) => void;
};

type GoogleCodeResponse = {
  code?: string;
  scope?: string;
};

type GoogleCodeError = {
  type: string;
  message?: string;
};

const GOOGLE_SCRIPT_ID = "google-identity-services";

export type UseGoogleAuthButtonCallbackProps = {
  error?: string;
  loading: boolean;
  user?: IUser;
};

type UseGoogleAuthButtonProps = {
  callback: (v: UseGoogleAuthButtonCallbackProps) => void;
};

export const useGoogleAuthButton = ({ callback }: UseGoogleAuthButtonProps) => {
  const codeClientRef = useRef<GoogleCodeClient | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientReady, setClientReady] = useState(false);

  const clientId = CONFIG.keys.google.oauth;
  const redirectUri = CONFIG.keys.google.redirectUri;
  const scopes = CONFIG.keys.google.scopes;

  const { loginGoogle } = useApi();

  useEffect(() => {
    let cancelled = false;

    const handleLoad = () => {
      if (!cancelled) setScriptReady(true);
    };

    const handleError = () => {
      if (!cancelled) {
        callback({
          error: "Failed to load Google Identity Services script.",
          loading: false,
        });
      }
    };

    const attachScript = () => {
      if (window.google?.accounts?.oauth2) {
        handleLoad();
        return;
      }

      const existing = document.getElementById(
        GOOGLE_SCRIPT_ID
      ) as HTMLScriptElement | null;

      if (existing) {
        existing.addEventListener("load", handleLoad);
        existing.addEventListener("error", handleError);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = GOOGLE_SCRIPT_ID;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", handleLoad);
      script.addEventListener("error", handleError);
      document.head.appendChild(script);
    };

    attachScript();

    return () => {
      cancelled = true;
      const existing = document.getElementById(GOOGLE_SCRIPT_ID);
      if (existing) {
        existing.removeEventListener("load", handleLoad);
        existing.removeEventListener("error", handleError);
      }
    };
  }, [callback]);

  const submitCode = useCallback(
    async (code: string, scope?: string) => {
      callback({ loading: true });
      setLoading(true);

      const userRes = await loginGoogle({ code, scope });

      setLoading(false);
      if (userRes.err || !userRes.data) {
        console.log(`Internal Error - Login Google: ${stringify(userRes)}`);
        callback({
          error: "Unable to complete Google login. Please try again.",
          loading: false,
        });
        return;
      }

      const user = AUserToIUser(userRes.data);
      callback({ loading: false, user });
    },
    [callback, loginGoogle]
  );

  useEffect(() => {
    setClientReady(false);
    if (!scriptReady || !clientId || !window.google?.accounts?.oauth2) return;

    codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      ux_mode: "popup",
      prompt: "consent",
      access_type: "offline",
      callback: (response: GoogleCodeResponse) => {
        if (!response.code) {
          callback({
            error: "Google did not return an authorization code.",
            loading: false,
          });
          return;
        }
        submitCode(response.code, response.scope);
      },
      error_callback: (error: GoogleCodeError) => {
        setLoading(false);
        callback({
          error: error.message ?? "Google authorization was cancelled.",
          loading: false,
        });
      },
    });
    setClientReady(true);
  }, [
    clientId,
    redirectUri,
    scopes,
    scriptReady,
    callback,
    submitCode,
  ]);

  useEffect(() => {
    return () => {
      setClientReady(false);
    };
  }, [scriptReady]);

  const requestCode = useCallback(() => {
    if (!codeClientRef.current) {
      callback({
        error: "Google client is not ready yet. Please wait a moment.",
        loading: false,
      });
      return;
    }
    codeClientRef.current.requestCode();
  }, [callback]);

  const disabled = !clientReady || loading;

  return {
    disabled,
    loading,
    onClick: requestCode,
  };
};
