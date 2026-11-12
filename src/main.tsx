import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { IconResourceProvider } from "./components/Icon";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <IconResourceProvider resources={{}}><App /></IconResourceProvider>
  </React.StrictMode>,
);
