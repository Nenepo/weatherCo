import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { registerServiceWorker } from "./push.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" />
  </StrictMode>
);

// Register SW early
registerServiceWorker();
