import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { LeadSearchPage, NotFoundPage } from "../pages";
import { AppLayout } from "../layouts";

export const NavigationProvider = () => {
  return (
    <BrowserRouter
    // basename="/BigRealEstate/"
    >
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<LeadSearchPage />} />
          {/* <Route path="404" /> */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
