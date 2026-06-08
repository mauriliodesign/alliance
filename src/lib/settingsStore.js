// Settings backed by the active organization's row (organizations table).
import { supabase } from "./supabaseClient";

export const DEFAULT_SETTINGS = {
  business: { name: "", address: "", phone: "", whatsapp: "", email: "", instagram: "" },
  pipeline: { tags: [], followupDays: 3, stageLabels: {} },
  integrations: { gtmId: "", aiEnabled: true, geminiModel: "gemini-2.5-flash" },
  account: { adminEmail: "" },
};

let _qc = null;
let _orgId = null;
let _cache = DEFAULT_SETTINGS;
export function bindSettings(queryClient, orgId) {
  _qc = queryClient;
  _orgId = orgId;
}

export function orgToSettings(o) {
  if (!o) return DEFAULT_SETTINGS;
  const s = {
    business: {
      name: o.name || "",
      address: o.address || "",
      phone: o.phone || "",
      whatsapp: o.whatsapp || "",
      email: o.email || "",
      instagram: o.instagram || "",
    },
    pipeline: { tags: o.tags || [], followupDays: o.followup_days ?? 3, stageLabels: o.stage_labels || {} },
    integrations: { gtmId: o.gtm_id || "", aiEnabled: o.ai_enabled ?? true, geminiModel: o.gemini_model || "gemini-2.5-flash" },
    account: { adminEmail: "" },
  };
  _cache = s;
  return s;
}

export function getSettings() {
  return _cache;
}

export async function fetchOrgSettings(orgId) {
  if (!orgId) return DEFAULT_SETTINGS;
  const { data, error } = await supabase.from("organizations").select("*").eq("id", orgId).single();
  if (error) throw error;
  return orgToSettings(data);
}

const COL = {
  business: { name: "name", address: "address", phone: "phone", whatsapp: "whatsapp", email: "email", instagram: "instagram" },
  pipeline: { tags: "tags", followupDays: "followup_days", stageLabels: "stage_labels" },
  integrations: { gtmId: "gtm_id", aiEnabled: "ai_enabled", geminiModel: "gemini_model" },
};

// Accepts the same partial nested shape the UI already uses.
export async function updateSettings(patch) {
  const cols = {};
  for (const group of ["business", "pipeline", "integrations"]) {
    if (patch[group]) {
      for (const [k, v] of Object.entries(patch[group])) {
        if (COL[group][k]) cols[COL[group][k]] = v;
      }
    }
  }
  if (Object.keys(cols).length && _orgId) {
    await supabase.from("organizations").update(cols).eq("id", _orgId);
    if (_qc) await _qc.invalidateQueries({ queryKey: ["org", _orgId] });
  }
}
