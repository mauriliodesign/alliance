import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import { OrgProvider, useOrg } from "./org/OrgProvider";
import { LanguageProvider } from "./i18n/LanguageContext";
import { BookingProvider } from "./components/BookingContext";
import { ToastProvider } from "./components/ToastContext";
import { bindData } from "./lib/leadsStore";
import { bindSettings } from "./lib/settingsStore";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

// Wires the query client + active org into the data layer modules.
function DataBridge() {
  const qc = useQueryClient();
  const { orgId } = useOrg();
  useEffect(() => {
    bindData(qc, orgId);
    bindSettings(qc, orgId);
  }, [qc, orgId]);
  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <OrgProvider>
            <LanguageProvider>
              <ToastProvider>
                <BookingProvider>
                  <DataBridge />
                  <App />
                </BookingProvider>
              </ToastProvider>
            </LanguageProvider>
          </OrgProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
