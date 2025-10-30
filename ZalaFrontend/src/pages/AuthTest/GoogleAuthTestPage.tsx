import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; width?: number | string }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

type GoogleCredentialResponse = {
  credential: string;
};

type UserPublic = {
  user_id: number;
  username: string;
  profile_pic?: string | null;
  role?: string | null;
  xp: number;
  contact?: {
    contact_id?: number;
    first_name?: string;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
};

const GOOGLE_SCRIPT_ID = "google-identity-services";

export const GoogleAuthTestPage = () => {
  const [idToken, setIdToken] = useState("");
  const [user, setUser] = useState<UserPublic | null>(null);
  const [rawPayload, setRawPayload] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "loaded">("idle");
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ??
    import.meta.env.GOOGLE_CLIENT_ID ??
    ""; // fallback if Vite prefix missing

  const apiUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_URL ?? import.meta.env.API_URL ?? "http://127.0.0.1:8000";
    return base.replace(/\/$/, "");
  }, []);

  useEffect(() => {
    let cancelled = false;

    const handleLoad = () => {
      if (!cancelled) {
        setScriptReady(true);
      }
    };

    const handleError = () => {
      if (!cancelled) {
        setError("Failed to load Google Identity Services script.");
      }
    };

    const attachScript = () => {
      if (window.google?.accounts?.id) {
        handleLoad();
        return;
      }

      const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;

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

  const submitToken = useCallback(
    async (token: string) => {
      if (!token) {
        setError("Paste an ID token first or sign in with Google.");
        return;
      }

      setError(null);
      setStatus("loading");
      setUser(null);
      setRawPayload("");

      try {
        const response = await fetch(`${apiUrl}/api/login/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_token: token }),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.detail || "Google login failed.");
        }

        setStatus("loaded");
        setUser(payload as UserPublic);
        setRawPayload(JSON.stringify(payload, null, 2));
      } catch (err) {
        setStatus("idle");
        setUser(null);
        setRawPayload("");
        setError(err instanceof Error ? err.message : "Unexpected error.");
      }
    },
    [apiUrl]
  );

  const handleGoogleCredential = useCallback(
    (response: GoogleCredentialResponse) => {
      if (!response?.credential) {
        setError("Google returned an empty credential. Try again.");
        return;
      }
      setIdToken(response.credential);
      void submitToken(response.credential);
    },
    [submitToken]
  );

  useEffect(() => {
    if (!scriptReady || !clientId || !window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential,
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
  }, [clientId, handleGoogleCredential, scriptReady]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void submitToken(idToken);
    },
    [idToken, submitToken]
  );

  const clientStatus = useMemo(() => {
    if (!clientId) {
      return "Missing VITE_GOOGLE_CLIENT_ID in your frontend .env file.";
    }
    if (!scriptReady) {
      return "Loading Google Identity Services…";
    }
    return null;
  }, [clientId, scriptReady]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Google Sign-In Debugger</h1>
        <p className="text-sm text-slate-500">
          Use this page to obtain a real Google ID token and test the <code>/api/login/google</code>{" "}
          endpoint.
        </p>
      </header>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-medium">1. Sign in with Google</h2>
        <p className="mb-4 text-sm text-slate-600">
          The button below is powered by Google Identity Services. When you successfully sign in,
          your ID token is automatically sent to the backend tester.
        </p>
        {clientStatus ? (
          <div className="rounded border border-amber-400 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {clientStatus}
          </div>
        ) : (
          <div ref={buttonContainerRef} className="flex justify-start" />
        )}
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-medium">2. Manual token submission (optional)</h2>
        <p className="mb-4 text-sm text-slate-600">
          Paste any valid Google ID token below to re-run the request.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            className="h-28 w-full resize-none rounded border border-slate-300 p-3 font-mono text-xs"
            value={idToken}
            onChange={(event) => setIdToken(event.target.value.trim())}
            placeholder="Paste ID token here…"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={!idToken || status === "loading"}
          >
            {status === "loading" ? "Posting…" : "Send to backend"}
          </button>
        </form>
      </section>

      {(error || user || rawPayload) && (
        <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-medium">3. Response</h2>
          {error && (
            <div className="mb-4 rounded border border-rose-400 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          {user && (
            <div className="mb-4 space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-semibold">User ID:</span> {user.user_id}
              </p>
              <p>
                <span className="font-semibold">Username:</span> {user.username}
              </p>
              {user.contact?.email && (
                <p>
                  <span className="font-semibold">Email:</span> {user.contact.email}
                </p>
              )}
              {user.profile_pic && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Avatar:</span>
                  <img
                    src={user.profile_pic}
                    alt="Google avatar"
                    className="h-8 w-8 rounded-full border border-slate-200"
                  />
                </div>
              )}
            </div>
          )}
          {rawPayload && (
            <pre className="max-h-64 overflow-auto rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
              {rawPayload}
            </pre>
          )}
        </section>
      )}
    </div>
  );
};
