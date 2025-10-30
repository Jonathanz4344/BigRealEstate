import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIG } from "../../../config";
import { useApi } from "../../api";
import { stringify } from "../../../utils";
import { AUserToIUser, type IUser } from "../../../interfaces";

type GoogleCredentialResponse = {
  credential: string;
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
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);

  const [scriptReady, setScriptReady] = useState(false);

  const clientId = CONFIG.keys.google.oauth;
  const { loginGoogle } = useApi();

  useEffect(() => {
    let cancelled = false;

    const handleLoad = () => {
      if (!cancelled) {
        setScriptReady(true);
      }
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
      if (window.google?.accounts?.id) {
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

    const interval = window.setInterval(() => {
      if (window.google?.accounts?.id) {
        window.clearInterval(interval);
        handleLoad();
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      const existing = document.getElementById(GOOGLE_SCRIPT_ID);
      if (existing) {
        existing.removeEventListener("load", handleLoad);
        existing.removeEventListener("error", handleError);
      }
    };
  }, []);

  useEffect(() => {
    if (!scriptReady || !clientId || !window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (res: GoogleCredentialResponse) =>
        res?.credential
          ? submitToken(res.credential)
          : callback({
              error: "Google returned an empty credential. Try again.",
              loading: false,
            }),
    });

    if (buttonContainerRef.current) {
      buttonContainerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        theme: "outline",
        size: "large",
        width: "100%",
      });
      window.google.accounts.id.prompt();
    }
  }, [clientId, scriptReady]);

  const submitToken = useCallback(async (token: string) => {
    callback({ loading: true });

    const userRes = await loginGoogle({ token });

    if (userRes.err || !userRes.data) {
      console.log(`Internal Error - Login Google: ${stringify(userRes)}`);
      console.log(``);
      callback({
        // error: "Internal error - please try again later",
        loading: false,
      });
      return;
    }

    const user = AUserToIUser(userRes.data);

    callback({ loading: false, user });
  }, []);

  return buttonContainerRef;
};
