import { useQuery } from "@tanstack/react-query";
import { fetchOrgSettings, DEFAULT_SETTINGS } from "../lib/settingsStore";
import { useOrg } from "../org/OrgProvider";

// Admin settings = the active organization's row, mapped to the settings shape.
export function useSettings() {
  const { orgId } = useOrg();
  const { data } = useQuery({
    queryKey: ["org", orgId],
    queryFn: () => fetchOrgSettings(orgId),
    enabled: Boolean(orgId),
  });
  return data ?? DEFAULT_SETTINGS;
}
