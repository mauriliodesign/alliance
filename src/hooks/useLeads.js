import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "../lib/leadsStore";
import { useOrg } from "../org/OrgProvider";

// Returns the active org's leads (assembled shape). Empty array while loading.
export function useLeads() {
  const { orgId } = useOrg();
  const { data } = useQuery({
    queryKey: ["leads", orgId],
    queryFn: () => fetchLeads(orgId),
    enabled: Boolean(orgId),
  });
  return data ?? [];
}
