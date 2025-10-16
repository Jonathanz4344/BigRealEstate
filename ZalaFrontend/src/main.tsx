import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import { config } from "dotenv";
import App from "./App.tsx";

// config();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
