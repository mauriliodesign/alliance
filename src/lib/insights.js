import { timeAgo } from "./format";

const DAY = 86400000;

// Minimal, privacy-conscious context for a single lead (first name only, no email/phone).
export function buildLeadContext(lead, settings, lang = "pt") {
  const firstName = (lead.name || "").trim().split(/\s+/)[0] || "Lead";
  const daysInPipeline = Math.max(0, Math.round((Date.now() - lead.createdAt) / DAY));
  const followups = (lead.followups || []).map((n) => ({ text: n.text, when: timeAgo(n.createdAt, lang) }));
  const stageChanges = (lead.activity || [])
    .filter((a) => a.type === "stage")
    .map((a) => ({ to: a.to, when: timeAgo(a.createdAt, lang) }));

  return {
    business: businessContext(settings),
    lead: {
      firstName,
      stage: lead.stage,
      daysInPipeline,
      source: lead.source,
      tags: lead.tags || [],
      task: lead.task ? { text: lead.task.text, due: lead.task.due } : null,
      followups,
      stageChanges,
    },
  };
}

// Context for the whole active pipeline (excludes won/lost).
export function buildPipelineContext(leads, settings, lang = "pt") {
  const active = leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
  return {
    business: businessContext(settings),
    leads: active.map((l) => ({
      id: l.id,
      firstName: (l.name || "").trim().split(/\s+/)[0] || "Lead",
      stage: l.stage,
      daysInPipeline: Math.max(0, Math.round((Date.now() - l.createdAt) / DAY)),
      tags: l.tags || [],
      task: l.task ? { text: l.task.text, due: l.task.due } : null,
      lastFollowup: (l.followups || [])[0]?.text || null,
      followupCount: (l.followups || []).length,
    })),
  };
}

function businessContext(settings) {
  return {
    academy: settings?.business?.name || "Alliance Jiu Jitsu Lisboa",
    offer: "Free trial class",
    pricing: { kids: "59€/mo", adults: "79€/mo", dropIn: "20€", private1x: "165€/mo", private2x: "315€/mo" },
  };
}

const ERROR_KEYS = {
  missing_key: "insights.errMissingKey",
  rate_limited: "insights.errRateLimit",
};

// Calls the serverless proxy. Throws an Error whose message is an i18n key.
export async function generateInsight({ kind, data, lang, model }) {
  let resp;
  try {
    resp = await fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, data, lang, model }),
    });
  } catch {
    throw new Error("insights.errNetwork");
  }
  if (!resp.ok) {
    let body = {};
    try {
      body = await resp.json();
    } catch {
      /* ignore */
    }
    throw new Error(ERROR_KEYS[body.error] || "insights.errGeneric");
  }
  return resp.json();
}
