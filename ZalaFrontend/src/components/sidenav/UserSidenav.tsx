import { Button, GoogleAuthButton } from "../buttons";
import {
  useAppNavigation,
  useGoogleAuthButtonCallback,
  useLogout,
} from "../../hooks";
import { useAuthStore, useSideNavControlStore } from "../../stores";
import Avatar from "@mui/material/Avatar";
import { COLORS } from "../../config";

export const UserSidenav = () => {
  const user = useAuthStore((state) => state.user);
  const closeSideNav = useSideNavControlStore((state) => state.close);
  const logout = useLogout();
  const { toEmailTestPage } = useAppNavigation();
  const googleConnectCallback = useGoogleAuthButtonCallback({
    onMsg: () => "Google account connected!",
  });

  const onLogout = () => (closeSideNav(), logout());
  const onOpenTestPage = () => {
    closeSideNav();
    toEmailTestPage();
  };

  const avatarSize = 150;
  return (
    user && (
      <div className="w-full h-full flex flex-col space-y-[30px]">
        <div className="w-full flex flex-col flex-1 space-y-[30px] overflow-y-scroll p-[30px]">
          <div className="w-full flex flex-col items-center justify-center">
            <Avatar
              sx={{
                width: avatarSize,
                height: avatarSize,
                bgcolor: COLORS.secondary50,
                fontSize: avatarSize * 0.25,
                fontWeight: "bold",
              }}
            >
              {user.contact!.firstName[0]}
              {user.contact!.lastName[0]}
            </Avatar>
            <div className="flex flex-col items-center justify-center mt-[10px]">
              <p className="text-secondary text-xl font-bold">
                {user.username}
              </p>
              <p className="text-secondary-50">
                {user.contact?.firstName} {user.contact?.lastName}
              </p>
            </div>
          </div>

          <div
            className={`w-full space-y-3 rounded-2xl border p-5 ${
              user.gmailConnected
                ? "border-[#d2e3fc] bg-[#f8fafd]"
                : "border-[#fad2cf] bg-[#fef7f5]"
            }`}
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
            {user.gmailConnected ? (
              <Button text="Open Gmail Test" onClick={onOpenTestPage} />
            ) : (
              <GoogleAuthButton
                callback={googleConnectCallback}
                className="w-full"
                getExtraPayload={() => ({ targetUserId: user.userId })}
              />
            )}
          </div>
        </div>
        <div className="p-[30px]">
          <Button text="Logout" onClick={onLogout} />
        </div>
      </div>
    )
  );
};
