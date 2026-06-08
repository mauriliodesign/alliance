import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import { OrgProvider } from "./org/OrgProvider";
import { LanguageProvider } from "./i18n/LanguageContext";
import { BookingProvider } from "./components/BookingContext";
import { ToastProvider } from "./components/ToastContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OrgProvider>
          <LanguageProvider>
            <ToastProvider>
              <BookingProvider>
                <App />
              </BookingProvider>
            </ToastProvider>
          </LanguageProvider>
        </OrgProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
