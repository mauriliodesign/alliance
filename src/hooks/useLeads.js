import { useSyncExternalStore } from "react";
import { getLeads, subscribe } from "../lib/leadsStore";

// Re-renders consumers whenever the leads store changes.
export function useLeads() {
  return useSyncExternalStore(subscribe, getLeads, getLeads);
}
