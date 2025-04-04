import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { RemoteModuleProvider } from "../assets/RemoteModuleProvider.jsx";
import { Root } from "./Root.jsx";
import "../../index.css";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RemoteModuleProvider>
      <Root></Root>
    </RemoteModuleProvider>
  </StrictMode>
);
