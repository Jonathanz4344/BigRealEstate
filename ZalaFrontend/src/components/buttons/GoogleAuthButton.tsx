import {
  useGoogleAuthButton,
  type UseGoogleAuthButtonCallbackProps,
} from "../../hooks";
import type { LoginGoogleProps } from "../../hooks";
import { Loader2 } from "lucide-react";

export type GoogleAuthButtonCallback = (
  v: UseGoogleAuthButtonCallbackProps
) => void;

type GoogleAuthButtonProps = {
  callback: GoogleAuthButtonCallback;
  text?: string;
  className?: string;
  getExtraPayload?: () =>
    | Partial<Omit<LoginGoogleProps, "code" | "scope">>
    | undefined;
};

export const GoogleAuthButton = ({
  callback,
  text = "Sign in with Google",
  className = "",
  getExtraPayload,
}: GoogleAuthButtonProps) => {
  const { disabled, loading, onClick } = useGoogleAuthButton({
    callback,
    getExtraPayload,
  });
  const label = loading ? "Connecting Google account" : text;

  return (
    <button
      type="button"
      aria-label={label}
      className={`relative inline-flex w-full items-center justify-center gap-3 rounded-[4px] border border-[#dadce0] bg-white px-5 py-2.5 text-[15px] font-medium text-[#3c4043] shadow-[0_2px_2px_rgba(0,0,0,0.1)] transition hover:border-[#d2e3fc] hover:bg-[#f8fafd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      disabled={disabled}
      onClick={onClick}
      data-google="signin-button"
    >
      <span className="absolute left-4 flex h-5 w-5 items-center justify-center">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#5f6368]" />
        ) : (
          <GoogleGlyph className="h-5 w-5" />
        )}
      </span>
      <span className="text-[15px] leading-none">
        {loading ? "Connecting..." : text}
      </span>
    </button>
  );
};

const GoogleGlyph = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.86-.07-1.49-.22-2.14H12v4.07h6.51c-.13 1.07-.84 2.68-2.4 3.77v3.12h3.87c2.27-2.09 3.51-5.18 3.51-8.82Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.96-1.08 7.95-2.92l-3.87-3.12c-1.04.73-2.44 1.24-4.08 1.24-3.14 0-5.8-2.11-6.75-4.99H1.26v3.14C3.24 21.33 7.27 24 12 24Z"
    />
    <path
      fill="#FABB05"
      d="M5.25 14.21c-.24-.73-.38-1.51-.38-2.32s.14-1.59.38-2.32V6.43H1.26A11.96 11.96 0 0 0 0 11.89c0 1.93.46 3.75 1.26 5.46l3.99-3.14Z"
    />
    <path
      fill="#E94235"
      d="M12 4.74c1.76 0 3.32.6 4.56 1.79l3.42-3.42C17.96 1.18 15.24 0 12 0 7.27 0 3.24 2.67 1.26 6.43l3.99 3.14C6.2 6.85 8.86 4.74 12 4.74Z"
    />
  </svg>
);
