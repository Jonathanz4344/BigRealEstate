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
  const ref = useGoogleAuthButton({ callback });
  return <div ref={ref}></div>;
};
