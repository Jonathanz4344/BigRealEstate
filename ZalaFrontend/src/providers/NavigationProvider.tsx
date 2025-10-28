import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { CampaignPage, LeadSearchPage, NotFoundPage } from "../pages";
import { AppLayout } from "../layouts";

export const NavigationProvider = () => {
  return (
    <BrowserRouter
    // basename="/BigRealEstate/"
    >
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<LeadSearchPage />} />
          <Route path="/campaign/:campaignId" element={<CampaignPage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to={"/404"} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
