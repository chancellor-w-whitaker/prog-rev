import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { Wrapper } from "./Wrapper.jsx";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Wrapper>
      <App />
    </Wrapper>
  </StrictMode>
);
