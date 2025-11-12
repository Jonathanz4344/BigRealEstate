import {
  useGoogleAuthButton,
  type UseGoogleAuthButtonCallbackProps,
} from "../../hooks";
import type { LoginGoogleProps } from "../../hooks";

export type GoogleAuthButtonCallback = (
  v: UseGoogleAuthButtonCallbackProps
) => void;

type GoogleAuthButtonProps = {
  callback: GoogleAuthButtonCallback;
  text?: string;
  className?: string;
  getExtraPayload?: () => Partial<Omit<LoginGoogleProps, "code" | "scope">> | undefined;
};

export const GoogleAuthButton = ({
  callback,
  text = "Continue with Google",
  className = "",
  getExtraPayload,
}: GoogleAuthButtonProps) => {
  const { disabled, loading, onClick } = useGoogleAuthButton({
    callback,
    getExtraPayload,
  });
  return (
    <button
      className={`w-full flex flex-row items-center justify-center space-x-2 rounded-md border border-secondary-25 py-2 px-3 text-secondary hover:bg-secondary hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span>{loading ? "Connecting..." : text}</span>
    </button>
  );
};
