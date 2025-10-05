import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { HomePage, NotFoundPage, FourUpPage, Hours } from "../pages";
import { AppLayout } from "../layouts";

export const NavigationProvider = () => {
  return (
    <BrowserRouter basename="/BigRealEstate/">
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to={"/home"} />} />

          <Route path="/home" element={<HomePage />} />
          <Route path="/fourup" element={<FourUpPage />} />
          <Route path="/hours" element={<Hours />} />
          <Route path="/*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
