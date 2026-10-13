import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { PertProvider } from "@@/lib/main";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PertProvider>
      <App />
    </PertProvider>
  </StrictMode>
);
