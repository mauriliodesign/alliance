import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../auth/AuthProvider";

const OrgContext = createContext(null);
const ACTIVE_KEY = "ajj-active-org";

export function OrgProvider({ children }) {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState(() => localStorage.getItem(ACTIVE_KEY) || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setOrgs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // RLS limits this to the current user's memberships.
    supabase
      .from("memberships")
      .select("role, organizations(*)")
      .then(({ data }) => {
        if (cancelled) return;
        const list = (data || [])
          .filter((m) => m.organizations)
          .map((m) => ({ role: m.role, ...m.organizations }));
        setOrgs(list);
        setOrgId((prev) => (prev && list.some((o) => o.id === prev) ? prev : list[0]?.id || null));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (orgId) localStorage.setItem(ACTIVE_KEY, orgId);
  }, [orgId]);

  const org = orgs.find((o) => o.id === orgId) || null;

  return (
    <OrgContext.Provider
      value={{ orgs, org, orgId, role: org?.role ?? null, setActiveOrg: setOrgId, loading }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within OrgProvider");
  return ctx;
}
