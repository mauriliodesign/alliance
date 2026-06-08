// Client-side settings store (localStorage). Single source of truth for
// business info, pipeline presets and integrations used across the app.

const KEY = "ajj-settings";
const listeners = new Set();

export const DEFAULT_SETTINGS = {
  business: {
    name: "Alliance Jiu Jitsu Lisboa",
    address: "Rua Almirante Gago Coutinho 19B, Moscavide",
    phone: "+351 924 851 474",
    whatsapp: "351924851474",
    email: "geral@alliancejjlisboa.com",
    instagram: "alliancejjpdn_lisboa",
  },
  pipeline: {
    tags: ["adultos", "kids", "no-gi", "competidor", "reabertura"],
    followupDays: 3,
    stageLabels: {}, // optional overrides per stage id
  },
  integrations: {
    gtmId: "GTM-NGFMBB8M",
    googleCalendar: false,
  },
  account: {
    adminEmail: "",
  },
};

let cache = null;

function deepMerge(base, extra) {
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k in extra) {
    if (extra[k] && typeof extra[k] === "object" && !Array.isArray(extra[k])) {
      out[k] = deepMerge(base[k] || {}, extra[k]);
    } else {
      out[k] = extra[k];
    }
  }
  return out;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return deepMerge(DEFAULT_SETTINGS, JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

function read() {
  if (!cache) cache = load();
  return cache;
}

function write(next) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
}

export function getSettings() {
  return read();
}

// patch is a partial settings object (deep-merged).
export function updateSettings(patch) {
  write(deepMerge(read(), patch));
}

export function resetSettings() {
  write(DEFAULT_SETTINGS);
}

export function subscribeSettings(fn) {
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
