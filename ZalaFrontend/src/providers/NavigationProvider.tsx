import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import {
  CampaignPage,
  LeadSearchPage,
  NotFoundPage,
  SignupPage,
  LoginPage,
  TestEmailPage,
} from "../pages";
import { AppLayout } from "../layouts";
import { useAuthStore } from "../stores";
import { AuthLayout } from "../layouts/AuthLayout";
import { useAutoLogin, useTimeoutEffect } from "../hooks";
import { useState } from "react";
import { stringify } from "../utils";

export const NavigationProvider = () => {
  const user = useAuthStore((state) => state.user);
  const [authView, setAuthView] = useState(true);

  useAutoLogin();
  useTimeoutEffect(
    () => {
      setAuthView(user ? true : false);
    },
    [stringify(user)],
    500
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route element={authView ? <AppLayout /> : <AuthLayout />}>
          {authView && (
            <>
              <Route index element={<LeadSearchPage />} />
              <Route path="/campaign/:campaignId" element={<CampaignPage />} />
              <Route path="/email-test" element={<TestEmailPage />} />
              <Route path="/signup" element={<Navigate to={"/"} />} />
              <Route path="/login" element={<Navigate to={"/"} />} />
            </>
          )}

          {!authView && (
            <>
              <Route index path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </>
          )}

          <Route
            path="404"
            element={authView ? <NotFoundPage /> : <Navigate to={"/login"} />}
          />
          <Route
            path="*"
            element={<Navigate to={authView ? "/404" : "/login"} />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
