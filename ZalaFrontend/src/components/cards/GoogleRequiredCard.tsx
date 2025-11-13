import { GoogleAuthButton } from "../buttons";
import type { IUser } from "../../interfaces";
import { useGoogleAuthButtonCallback } from "../../hooks";
import clsx from "clsx";

type GoogleRequiredCardProps = {
  user: IUser;
};

export const GoogleRequiredCard = ({ user }: GoogleRequiredCardProps) => {
  const googleConnectCallback = useGoogleAuthButtonCallback({
    onMsg: () => "Google account connected!",
  });
  return (
    <div
      className={clsx(
        `w-full space-y-3 rounded-2xl border p-5`,
        "border-secondary-50 bg-white"
      )}
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-secondary-50">
        Google Workspace
      </p>
      <p className="text-xl font-semibold text-secondary">
        {user.gmailConnected
          ? "Gmail account connected"
          : "Connect your Google account"}
      </p>
      <p className="text-sm text-secondary-50">
        {user.gmailConnected
          ? "You're ready to send Gmail campaigns from Zala."
          : "Sign in with Google to enable Gmail sending from campaigns and test emails."}
      </p>

      <GoogleAuthButton
        callback={googleConnectCallback}
        className="w-full cursor-pointer"
        getExtraPayload={() => ({ targetUserId: user.userId })}
      />
    </div>
  );
};
