import { Button } from "../buttons";
import { useAppNavigation, useLogout } from "../../hooks";
import { useAuthStore, useSideNavControlStore } from "../../stores";
import Avatar from "@mui/material/Avatar";
import { COLORS } from "../../config";

export const UserSidenav = () => {
  const user = useAuthStore((state) => state.user);
  const closeSideNav = useSideNavControlStore((state) => state.close);
  const logout = useLogout();
  const { toEmailTestPage } = useAppNavigation();

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

          <div className="w-full space-y-2 rounded-lg border border-secondary-25 p-4 text-secondary">
            <p className="text-base font-semibold">Gmail Status</p>
            <p
              className="font-medium"
              style={{
                color: user.gmailConnected
                  ? "var(--color-accent)"
                  : "var(--color-error)",
              }}
            >
              {user.gmailConnected ? "Connected" : "Not connected"}
            </p>
            <Button
              text="Open Gmail Test"
              onClick={onOpenTestPage}
              disabled={!user.gmailConnected}
            />
          </div>
        </div>
        <div className="p-[30px]">
          <Button text="Logout" onClick={onLogout} />
        </div>
      </div>
    )
  );
};
