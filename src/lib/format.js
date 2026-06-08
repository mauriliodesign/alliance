// Relative time, e.g. "há 2 dias" / "2 days ago" / "hace 2 días"
export function timeAgo(ts, lang = "pt") {
  const sec = Math.round((ts - Date.now()) / 1000);
  const abs = Math.abs(sec);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, s] of units) {
    if (abs >= s) return rtf.format(Math.round(sec / s), unit);
  }
  return rtf.format(0, "minute"); // "agora mesmo"
}

// Program interest options for a lead.
export const INTEREST_OPTS = [
  { value: "adults", label: "admin.intAdults" },
  { value: "kids", label: "admin.intKids" },
  { value: "nogi", label: "admin.intNogi" },
  { value: "private", label: "admin.intPrivate" },
];

export const interestKey = (value) => INTEREST_OPTS.find((o) => o.value === value)?.label || null;

export const TAG_SUGGESTIONS = ["adultos", "kids", "no-gi", "competidor", "reabertura"];

// One small colour cue per stage (used only as a dot, like the selected menu item).
export const STAGE_DOT = {
  new: "bg-alliance-yellow",
  contacted: "bg-sky-400",
  scheduled: "bg-indigo-400",
  attended: "bg-amber-400",
  won: "bg-emerald-400",
  lost: "bg-rose-500",
};

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic pleasant color from a string (HSL).
export function colorFromString(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 45% 38%)`;
}

const STAGE_KEYS = {
  new: "admin.stage.new",
  contacted: "admin.stage.contacted",
  scheduled: "admin.stage.scheduled",
  attended: "admin.stage.attended",
  won: "admin.stage.won",
  lost: "admin.stage.lost",
};

export function exportLeadsCsv(leads, t) {
  const header = ["Name", "Email", "Phone", "Stage", "Source", "Tags", "Created"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = leads.map((l) =>
    [
      l.name,
      l.email,
      l.phone || "",
      t(STAGE_KEYS[l.stage] || l.stage),
      l.source === "manual" ? t("admin.sourceManual") : t("admin.sourceForm"),
      (l.tags || []).join(", "),
      new Date(l.createdAt).toISOString().slice(0, 10),
    ]
      .map(esc)
      .join(",")
  );
  const csv = [header.map(esc).join(","), ...rows].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `alliance-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
