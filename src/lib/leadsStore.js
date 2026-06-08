// Supabase-backed data layer for leads (replaces the old localStorage store).
// Keeps the SAME function names/signatures so components stay unchanged.
// Reads are assembled into the shape the UI already expects:
//   lead = { id, name, email, phone, instagram, source, stage, tags[],
//            createdAt(ms), followups[], activity[], task|null, insight|null }
import { supabase } from "./supabaseClient";

export const STAGES = ["new", "contacted", "scheduled", "attended", "won", "lost"];

const pad = (n) => String(n).padStart(2, "0");
const dstr = (offsetDays = 0) => {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const isOverdue = (due) => Boolean(due) && due < dstr(0);
export const isDueToday = (due) => due === dstr(0);

const ms = (iso) => (iso ? new Date(iso).getTime() : Date.now());

// --- binding to React Query + active org (set by <DataBridge/>) ---
let _qc = null;
let _orgId = null;
let _cache = [];
export function bindData(queryClient, orgId) {
  _qc = queryClient;
  _orgId = orgId;
}
async function refresh() {
  if (_qc && _orgId) await _qc.invalidateQueries({ queryKey: ["leads", _orgId] });
}

function mapLead(r) {
  const followups = (r.followups || [])
    .map((f) => ({ id: f.id, text: f.body, createdAt: ms(f.created_at) }))
    .sort((a, b) => b.createdAt - a.createdAt);
  const activity = (r.lead_activity || [])
    .map((a) => ({ id: a.id, type: a.type, to: a.to_stage, from: a.from_stage, text: a.detail, createdAt: ms(a.created_at) }))
    .sort((a, b) => b.createdAt - a.createdAt);
  const openTasks = (r.tasks || [])
    .filter((t) => !t.done)
    .sort((a, b) => ((a.due_date || "") < (b.due_date || "") ? -1 : 1));
  const task = openTasks[0] ? { id: openTasks[0].id, text: openTasks[0].title, due: openTasks[0].due_date } : null;
  const ins = (r.lead_insights || [])[0];
  const insight = ins
    ? { closeProbability: ins.close_probability, ...(ins.payload || {}), generatedAt: ms(ins.generated_at), lang: ins.lang }
    : null;
  return {
    id: r.id,
    name: r.name,
    email: r.email || "",
    phone: r.phone || "",
    instagram: r.instagram || "",
    source: r.source,
    stage: r.stage,
    tags: r.tags || [],
    createdAt: ms(r.created_at),
    followups,
    activity,
    task,
    insight,
  };
}

export async function fetchLeads(orgId) {
  if (!orgId) return [];
  const { data, error } = await supabase
    .from("leads")
    .select("*, followups(*), tasks(*), lead_activity(*), lead_insights(*)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  _cache = (data || []).map(mapLead);
  return _cache;
}

// Synchronous snapshot (used by CSV export).
export function getLeads() {
  return _cache;
}

const leadOf = (id) => _cache.find((l) => l.id === id);

export async function addLead(lead) {
  const { data } = await supabase
    .from("leads")
    .insert({
      org_id: _orgId,
      name: (lead.name || "").trim() || "Lead",
      email: lead.email || null,
      phone: lead.phone || null,
      instagram: lead.instagram || null,
      tags: lead.tags || [],
      source: lead.source || "manual",
      stage: "new",
    })
    .select("id")
    .single();
  if (data) await supabase.from("lead_activity").insert({ org_id: _orgId, lead_id: data.id, type: "created" });
  await refresh();
  return data;
}

export async function updateLead(id, changes) {
  if ("insight" in changes) {
    const ins = changes.insight;
    if (ins) {
      await supabase.from("lead_insights").upsert(
        {
          org_id: _orgId,
          lead_id: id,
          close_probability: ins.closeProbability,
          payload: { signals: ins.signals, nextAction: ins.nextAction, suggestedMessage: ins.suggestedMessage, risks: ins.risks },
          lang: ins.lang,
          generated_at: new Date(ins.generatedAt || Date.now()).toISOString(),
        },
        { onConflict: "lead_id" }
      );
    }
    const rest = { ...changes };
    delete rest.insight;
    if (Object.keys(rest).length) await supabase.from("leads").update(rest).eq("id", id);
  } else {
    await supabase.from("leads").update(changes).eq("id", id);
  }
  await refresh();
}

export async function moveLead(id, stage) {
  if (!STAGES.includes(stage)) return;
  const from = leadOf(id)?.stage;
  if (from === stage) return;
  await supabase.from("leads").update({ stage }).eq("id", id);
  await supabase.from("lead_activity").insert({ org_id: _orgId, lead_id: id, type: "stage", from_stage: from, to_stage: stage });
  await refresh();
}

export async function addNote(id, text) {
  await supabase.from("followups").insert({ org_id: _orgId, lead_id: id, body: text.trim() });
  await refresh();
}

export async function deleteNote(id, noteId) {
  await supabase.from("followups").delete().eq("id", noteId);
  await refresh();
}

export async function setTask(id, text, due) {
  await supabase.from("tasks").insert({ org_id: _orgId, lead_id: id, title: text.trim(), due_date: due });
  await supabase.from("lead_activity").insert({ org_id: _orgId, lead_id: id, type: "task", detail: text.trim() });
  await refresh();
}

export async function clearTask(id) {
  await supabase.from("tasks").update({ done: true, done_at: new Date().toISOString() }).eq("lead_id", id).eq("done", false);
  await refresh();
}

export async function addTag(id, tag) {
  const t = tag.trim().toLowerCase();
  if (!t) return;
  const tags = leadOf(id)?.tags || [];
  if (tags.includes(t)) return;
  await supabase.from("leads").update({ tags: [...tags, t] }).eq("id", id);
  await refresh();
}

export async function removeTag(id, tag) {
  const tags = leadOf(id)?.tags || [];
  await supabase.from("leads").update({ tags: tags.filter((x) => x !== tag) }).eq("id", id);
  await refresh();
}

export async function deleteLead(id) {
  await supabase.from("leads").delete().eq("id", id); // children cascade
  await refresh();
}

// Undo: re-insert the lead + its notes/open task/activity from a snapshot.
export async function restoreLead(snap) {
  await supabase.from("leads").insert({
    id: snap.id,
    org_id: _orgId,
    name: snap.name,
    email: snap.email || null,
    phone: snap.phone || null,
    instagram: snap.instagram || null,
    tags: snap.tags || [],
    source: snap.source || "manual",
    stage: snap.stage || "new",
    created_at: new Date(snap.createdAt || Date.now()).toISOString(),
  });
  if (snap.followups?.length)
    await supabase.from("followups").insert(
      snap.followups.map((f) => ({ org_id: _orgId, lead_id: snap.id, body: f.text, created_at: new Date(f.createdAt).toISOString() }))
    );
  if (snap.task) await supabase.from("tasks").insert({ org_id: _orgId, lead_id: snap.id, title: snap.task.text, due_date: snap.task.due });
  await refresh();
}

export async function importLeads(list) {
  if (!Array.isArray(list)) throw new Error("invalid");
  const rows = list.map((l) => ({
    org_id: _orgId,
    name: l.name || "Lead",
    email: l.email || null,
    phone: l.phone || null,
    instagram: l.instagram || null,
    tags: l.tags || [],
    source: l.source || "import",
    stage: STAGES.includes(l.stage) ? l.stage : "new",
  }));
  if (rows.length) await supabase.from("leads").insert(rows);
  await refresh();
}

// "Reset demo data" → clears this academy's leads (children cascade).
export async function resetLeads() {
  await supabase.from("leads").delete().eq("org_id", _orgId);
  await refresh();
}
