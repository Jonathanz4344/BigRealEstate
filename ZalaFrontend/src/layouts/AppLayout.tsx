import { AppHeader, Sidenav } from "../components";
import { Outlet } from "react-router";
import { useSideNavControlStore } from "../stores";

export const AppLayout = () => {
  const { close: closeSideNav, isOpen } = useSideNavControlStore();
  return (
    <div className="w-screen h-screen flex flex-col">
      <AppHeader />

      <div className="relative flex flex-1">
        <Sidenav />
        <div
          onClick={isOpen ? closeSideNav : undefined}
          className="flex flex-1 flex-row overflow-y-scroll"
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};
