import { AppHeader } from "../components";
import { Outlet } from "react-router";

export const AppLayout = () => {
  return (
    <div>
      <AppHeader />

      <Outlet />
    </div>
  );
};
