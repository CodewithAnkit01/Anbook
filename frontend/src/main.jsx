import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PresenceProvider } from "./context/PresenceContext.jsx";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PresenceProvider>
          <App />
          <ToastContainer position="top-right" autoClose={3500} />
        </PresenceProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);