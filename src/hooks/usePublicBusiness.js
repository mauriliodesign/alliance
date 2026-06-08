import { useQuery } from "@tanstack/react-query";
import { supabase, ORG_SLUG } from "../lib/supabaseClient";

// Fallback to the flagship academy's info so the public site still renders
// instantly / offline while the row loads.
const FALLBACK = {
  name: "Alliance Jiu Jitsu Lisboa",
  address: "Rua Almirante Gago Coutinho 19B, Moscavide",
  phone: "+351 924 851 474",
  whatsapp: "351924851474",
  email: "geral@alliancejjlisboa.com",
  instagram: "alliancejjpdn_lisboa",
};

// Public academy info (anon) via the get_org_public(slug) RPC.
export function usePublicBusiness() {
  const { data } = useQuery({
    queryKey: ["publicOrg", ORG_SLUG],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_org_public", { p_slug: ORG_SLUG });
      if (error) throw error;
      return (Array.isArray(data) ? data[0] : data) || FALLBACK;
    },
    staleTime: 5 * 60 * 1000,
  });
  return data ?? FALLBACK;
}
