import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { RemoteModuleProvider } from "../assets/RemoteModuleProvider.jsx";
import { Root } from "./Root.jsx";
import "../../index.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RemoteModuleProvider>
      <Root></Root>
    </RemoteModuleProvider>
  </StrictMode>
);
