import {
  useGoogleAuthButton,
  type UseGoogleAuthButtonCallbackProps,
} from "../../hooks";

export type GoogleAuthButtonCallback = (
  v: UseGoogleAuthButtonCallbackProps
) => void;

type GoogleAuthButtonProps = {
  callback: GoogleAuthButtonCallback;
};

export const GoogleAuthButton = ({ callback }: GoogleAuthButtonProps) => {
  const { disabled, loading, onClick } = useGoogleAuthButton({ callback });
  return (
    <button
      className="w-full flex flex-row items-center justify-center space-x-2 rounded-md border border-secondary-25 py-2 px-3 text-secondary hover:bg-secondary hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span>{loading ? "Connecting..." : "Continue with Google"}</span>
    </button>
  );
};
