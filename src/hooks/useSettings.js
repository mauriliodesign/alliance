import { useSyncExternalStore } from "react";
import { getSettings, subscribeSettings } from "../lib/settingsStore";

export function useSettings() {
  return useSyncExternalStore(subscribeSettings, getSettings, getSettings);
}
