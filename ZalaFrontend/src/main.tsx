import { createRoot } from "react-dom/client";
import { enableMapSet } from "immer";
import { BrowserRouter, Routes, Route } from "react-router";
import { IMAGES } from "./assets/Images.ts";
import App from "./App.tsx";

enableMapSet();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/*" element={<App />} />
    </Routes>
  </BrowserRouter>,
);

document.getElementById("tab-img")?.setAttribute("href", IMAGES.ZalaTabLogo);
