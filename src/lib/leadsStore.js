// Lightweight client-side store for sales-pipeline leads.
// Leads submitted through the site's booking form are persisted here
// (localStorage) and surfaced in the /admin dashboard.

const KEY = "ajj-leads";
const listeners = new Set();

export const STAGES = ["new", "contacted", "scheduled", "attended", "won", "lost"];

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const day = 86400000;
const dstr = (offsetDays) => new Date(Date.now() + offsetDays * day).toISOString().slice(0, 10);

const SEED = [
  { id: uid(), name: "João Pereira", email: "joao.pereira@email.com", phone: "+351 912 345 678", source: "form", stage: "new", createdAt: Date.now() - day * 0.2, tags: ["adultos"], task: { text: "Ligar a confirmar interesse", due: dstr(1) } },
  { id: uid(), name: "Marta Silva", email: "marta.silva@email.com", phone: "+351 933 221 100", source: "form", stage: "new", createdAt: Date.now() - day * 4.1 },
  { id: uid(), name: "Ricardo Gomes", email: "r.gomes@email.com", phone: "+351 961 010 202", source: "form", stage: "contacted", createdAt: Date.now() - day * 2.4, tags: ["no-gi"], task: { text: "Enviar horários por WhatsApp", due: dstr(-1) }, followups: [{ id: uid(), text: "Primeiro contacto feito, vai pensar.", createdAt: Date.now() - day * 2 }] },
  { id: uid(), name: "Ana Costa", email: "ana.costa@email.com", phone: "+351 915 998 877", source: "form", stage: "scheduled", createdAt: Date.now() - day * 3.2, tags: ["kids"], task: { text: "Aula experimental marcada", due: dstr(0) } },
  { id: uid(), name: "Pedro Martins", email: "pedro.m@email.com", phone: "+351 962 334 556", source: "manual", stage: "attended", createdAt: Date.now() - day * 5, followups: [{ id: uid(), text: "Gostou da aula, decide até sexta.", createdAt: Date.now() - day * 1 }] },
  { id: uid(), name: "Sofia Almeida", email: "sofia.a@email.com", phone: "+351 934 778 990", source: "form", stage: "won", createdAt: Date.now() - day * 7, tags: ["adultos", "competidor"] },
  { id: uid(), name: "Bruno Dias", email: "bruno.dias@email.com", phone: "+351 911 223 344", source: "form", stage: "lost", createdAt: Date.now() - day * 9 },
];

function normalize(l) {
  return { followups: [], tags: [], activity: [], task: null, ...l };
}

let cache = null;

function load() {
  let raw;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    /* ignore */
  }
  let list;
  if (raw) {
    try {
      list = JSON.parse(raw);
    } catch {
      list = SEED;
    }
  } else {
    list = SEED;
    try {
      localStorage.setItem(KEY, JSON.stringify(SEED));
    } catch {
      /* ignore */
    }
  }
  return list.map(normalize);
}

function read() {
  if (!cache) cache = load().sort((a, b) => b.createdAt - a.createdAt);
  return cache;
}

function write(leads) {
  cache = [...leads].sort((a, b) => b.createdAt - a.createdAt);
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
}

function patch(id, fn) {
  write(read().map((l) => (l.id === id ? fn(l) : l)));
}

function logActivity(lead, type, extra = {}) {
  return { ...lead, activity: [{ id: uid(), type, createdAt: Date.now(), ...extra }, ...(lead.activity || [])] };
}

export function getLeads() {
  return read();
}

export function addLead(lead) {
  const item = normalize({ id: uid(), createdAt: Date.now(), stage: "new", source: "form", ...lead });
  item.activity = [{ id: uid(), type: "created", createdAt: item.createdAt }];
  write([item, ...read()]);
  return item;
}

export function updateLead(id, changes) {
  patch(id, (l) => ({ ...l, ...changes }));
}

export function moveLead(id, stage) {
  if (!STAGES.includes(stage)) return;
  patch(id, (l) => (l.stage === stage ? l : logActivity({ ...l, stage }, "stage", { from: l.stage, to: stage })));
}

export function addNote(id, text) {
  const note = { id: uid(), text: text.trim(), createdAt: Date.now() };
  patch(id, (l) => ({ ...l, followups: [note, ...(l.followups || [])] }));
  return note;
}

export function deleteNote(id, noteId) {
  patch(id, (l) => ({ ...l, followups: (l.followups || []).filter((n) => n.id !== noteId) }));
}

export function setTask(id, text, due) {
  patch(id, (l) => logActivity({ ...l, task: { text: text.trim(), due } }, "task", { text: text.trim(), due }));
}

export function clearTask(id) {
  patch(id, (l) => ({ ...l, task: null }));
}

export function addTag(id, tag) {
  const t = tag.trim().toLowerCase();
  if (!t) return;
  patch(id, (l) => (l.tags?.includes(t) ? l : { ...l, tags: [...(l.tags || []), t] }));
}

export function removeTag(id, tag) {
  patch(id, (l) => ({ ...l, tags: (l.tags || []).filter((x) => x !== tag) }));
}

export function deleteLead(id) {
  write(read().filter((l) => l.id !== id));
}

export function restoreLead(lead) {
  if (read().some((l) => l.id === lead.id)) return;
  write([lead, ...read()]);
}

export function subscribe(fn) {
  listeners.add(fn);
  const onStorage = (e) => {
    if (e.key === KEY) {
      cache = null;
      fn();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

/* ---------- date helpers for tasks ---------- */
export function isOverdue(due) {
  return Boolean(due) && due < dstr(0);
}
export function isDueToday(due) {
  return due === dstr(0);
}
