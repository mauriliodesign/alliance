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
