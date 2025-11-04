import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import {
  SignupPage,
  LoginPage,
  LeadSearchPage,
  CampaignPage,
  NotFoundPage,
} from "../pages";
import { RootLayout } from "../layouts";
import { useAuthStore } from "../stores";

export const NavigationProvider = () => {
  const user = useAuthStore((state) => state.user);
  const NavToLeadSearch = () => <Navigate to={"/"} />;
  const NavTo404 = () => <Navigate to={"/404"} />;
  const NavToLogin = () => <Navigate to={"/404"} />;
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route
            path="/login"
            element={user ? <NavToLeadSearch /> : <LoginPage />}
          />
          <Route
            path="/signup"
            element={user ? <NavToLeadSearch /> : <SignupPage />}
          />

          {!user && <Route path="*" element={<NavToLogin />} />}

          <Route index path="/" element={<LeadSearchPage />} />
          <Route path="/campaign/:campaignId" element={<CampaignPage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<NavTo404 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
