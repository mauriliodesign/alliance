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
const SEED = [
  { id: uid(), name: "João Pereira", email: "joao.pereira@email.com", phone: "+351 912 345 678", source: "form", stage: "new", createdAt: Date.now() - day * 0.2 },
  { id: uid(), name: "Marta Silva", email: "marta.silva@email.com", phone: "+351 933 221 100", source: "form", stage: "new", createdAt: Date.now() - day * 1.1 },
  { id: uid(), name: "Ricardo Gomes", email: "r.gomes@email.com", phone: "+351 961 010 202", source: "form", stage: "contacted", createdAt: Date.now() - day * 2.4 },
  { id: uid(), name: "Ana Costa", email: "ana.costa@email.com", phone: "+351 915 998 877", source: "form", stage: "scheduled", createdAt: Date.now() - day * 3.2 },
  { id: uid(), name: "Pedro Martins", email: "pedro.m@email.com", phone: "+351 962 334 556", source: "manual", stage: "attended", createdAt: Date.now() - day * 5 },
  { id: uid(), name: "Sofia Almeida", email: "sofia.a@email.com", phone: "+351 934 778 990", source: "form", stage: "won", createdAt: Date.now() - day * 7 },
  { id: uid(), name: "Bruno Dias", email: "bruno.dias@email.com", phone: "+351 911 223 344", source: "form", stage: "lost", createdAt: Date.now() - day * 9 },
];

// Cached, stable snapshot — required by useSyncExternalStore (the same
// reference must be returned until the data actually changes).
let cache = null;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(SEED));
  } catch {
    /* ignore */
  }
  return SEED;
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

export function getLeads() {
  return read();
}

export function addLead(lead) {
  const item = { id: uid(), createdAt: Date.now(), stage: "new", source: "form", ...lead };
  write([item, ...read()]);
  return item;
}

export function updateLead(id, patch) {
  write(read().map((l) => (l.id === id ? { ...l, ...patch } : l)));
}

export function moveLead(id, stage) {
  if (STAGES.includes(stage)) updateLead(id, { stage });
}

export function deleteLead(id) {
  write(read().filter((l) => l.id !== id));
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
