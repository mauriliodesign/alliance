import { useMemo, useState } from "react";
import {
  HiPlus,
  HiSearch,
  HiTrash,
  HiOutlineMail,
  HiOutlinePhone,
  HiX,
  HiUsers,
  HiBadgeCheck,
  HiTrendingUp,
  HiMenu,
} from "react-icons/hi";
import { useLang } from "../i18n/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Sidebar from "../components/admin/Sidebar";
import { useLeads } from "../hooks/useLeads";
import { STAGES, addLead, moveLead, deleteLead } from "../lib/leadsStore";

const STAGE_ACCENT = {
  new: { dot: "bg-alliance-yellow", text: "text-alliance-yellow", bar: "from-alliance-yellow/60" },
  contacted: { dot: "bg-sky-400", text: "text-sky-300", bar: "from-sky-400/60" },
  scheduled: { dot: "bg-violet-400", text: "text-violet-300", bar: "from-violet-400/60" },
  attended: { dot: "bg-amber-400", text: "text-amber-300", bar: "from-amber-400/60" },
  won: { dot: "bg-emerald-400", text: "text-emerald-300", bar: "from-emerald-400/60" },
  lost: { dot: "bg-rose-500", text: "text-rose-400", bar: "from-rose-500/60" },
};

export default function Admin() {
  const { t, lang } = useLang();
  const leads = useLeads();
  const [view, setView] = useState("pipeline");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.phone || "").toLowerCase().includes(q)
    );
  }, [leads, query]);

  const total = leads.length;
  const won = leads.filter((l) => l.stage === "won").length;
  const conversion = total ? Math.round((won / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-alliance-black">
      <Sidebar view={view} setView={setView} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-white/8 bg-alliance-black/90 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label={t("admin.menu")}
                className="text-2xl text-alliance-light lg:hidden"
              >
                <HiMenu />
              </button>
              <div>
                <h1 className="font-display text-2xl leading-none tracking-wide text-alliance-light">
                  {view === "pipeline" ? t("admin.title") : t("admin.navContacts")}
                </h1>
                <p className="text-xs text-alliance-light/50">{t("admin.subtitle")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={() => setAdding(true)}
                className="inline-flex items-center gap-2 rounded-full bg-alliance-yellow px-4 py-2.5 text-sm font-semibold text-alliance-black transition-colors hover:bg-alliance-yellow-light"
              >
                <HiPlus className="text-base" />
                <span className="hidden sm:inline">{t("admin.newLead")}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="px-5 py-6 sm:px-8">
          {/* Stats + search */}
          <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <Stat icon={HiUsers} label={t("admin.total")} value={total} accent="text-alliance-yellow" />
            <Stat icon={HiBadgeCheck} label={t("admin.enrolled")} value={won} accent="text-emerald-300" />
            <Stat icon={HiTrendingUp} label={t("admin.conversion")} value={`${conversion}%`} accent="text-sky-300" />
            <div className="relative flex items-center lg:w-72">
              <HiSearch className="pointer-events-none absolute left-4 text-lg text-alliance-light/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("admin.search")}
                className="w-full rounded-xl border border-white/10 bg-alliance-gray px-4 py-3 pl-11 text-sm text-alliance-light outline-none transition-colors placeholder:text-alliance-light/30 focus:border-alliance-yellow"
              />
            </div>
          </div>

          {view === "pipeline" ? (
            <KanbanBoard leads={filtered} t={t} lang={lang} />
          ) : (
            <ContactsTable leads={filtered} t={t} lang={lang} />
          )}
        </main>
      </div>

      {adding && <AddLeadModal t={t} onClose={() => setAdding(false)} />}
    </div>
  );
}

/* ---------------- Kanban ---------------- */

function KanbanBoard({ leads, t, lang }) {
  const [dragId, setDragId] = useState(null);
  const [overStage, setOverStage] = useState(null);

  const onDrop = (stage) => {
    if (dragId) moveLead(dragId, stage);
    setDragId(null);
    setOverStage(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const items = leads.filter((l) => l.stage === stage);
        const accent = STAGE_ACCENT[stage];
        const isOver = overStage === stage;
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={() => onDrop(stage)}
            className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-alliance-gray/40 transition-colors ${
              isOver ? "border-alliance-yellow/60 bg-alliance-gray/70" : "border-white/8"
            }`}
          >
            <div className="relative overflow-hidden rounded-t-2xl">
              <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accent.bar} to-transparent`} />
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
                  <span className="text-sm font-semibold text-alliance-light">
                    {t(`admin.stage.${stage}`)}
                  </span>
                </div>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-bold text-alliance-light/60">
                  {items.length}
                </span>
              </div>
            </div>

            <div className="flex min-h-24 flex-1 flex-col gap-2.5 p-3">
              {items.length === 0 ? (
                <p className="py-8 text-center text-xs text-alliance-light/25">{t("admin.empty")}</p>
              ) : (
                items.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    accent={accent}
                    lang={lang}
                    t={t}
                    dragging={dragId === lead.id}
                    onDragStart={() => setDragId(lead.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverStage(null);
                    }}
                    onDelete={() => {
                      if (window.confirm(t("admin.deleteConfirm"))) deleteLead(lead.id);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeadCard({ lead, accent, lang, t, dragging, onDragStart, onDragEnd, onDelete }) {
  const date = new Date(lead.createdAt).toLocaleDateString(lang, { day: "2-digit", month: "short" });
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group cursor-grab rounded-xl border border-white/8 bg-alliance-black p-3.5 transition-all hover:border-white/20 active:cursor-grabbing ${
        dragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-alliance-light">{lead.name}</h3>
        <button
          onClick={onDelete}
          aria-label="Delete"
          className="shrink-0 text-alliance-light/30 opacity-0 transition-all hover:text-rose-400 group-hover:opacity-100"
        >
          <HiTrash className="text-sm" />
        </button>
      </div>

      <a
        href={`mailto:${lead.email}`}
        className="mt-2 flex items-center gap-2 truncate text-xs text-alliance-light/55 transition-colors hover:text-alliance-yellow"
      >
        <HiOutlineMail className="shrink-0 text-sm" />
        <span className="truncate">{lead.email}</span>
      </a>
      {lead.phone && (
        <a
          href={`tel:${lead.phone.replace(/\s/g, "")}`}
          className="mt-1 flex items-center gap-2 text-xs text-alliance-light/55 transition-colors hover:text-alliance-yellow"
        >
          <HiOutlinePhone className="shrink-0 text-sm" />
          {lead.phone}
        </a>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
        <span className={`rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${accent.text}`}>
          {lead.source === "manual" ? t("admin.sourceManual") : t("admin.sourceForm")}
        </span>
        <span className="text-[10px] text-alliance-light/35">{date}</span>
      </div>
    </article>
  );
}

/* ---------------- Contacts table ---------------- */

function ContactsTable({ leads, t, lang }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-white/8 bg-alliance-gray/40 py-20 text-center text-sm text-alliance-light/40">
        {t("admin.empty")}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/8 bg-alliance-gray/40">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/8 text-xs uppercase tracking-wide text-alliance-light/45">
            <th className="px-5 py-3.5 font-semibold">{t("admin.colName")}</th>
            <th className="px-5 py-3.5 font-semibold">{t("modal.emailLabel")}</th>
            <th className="px-5 py-3.5 font-semibold">{t("modal.phoneLabel")}</th>
            <th className="px-5 py-3.5 font-semibold">{t("admin.colStage")}</th>
            <th className="px-5 py-3.5 font-semibold">{t("admin.sourceLabel")}</th>
            <th className="px-5 py-3.5 font-semibold">{t("admin.colDate")}</th>
            <th className="px-5 py-3.5 font-semibold text-right">{t("admin.colActions")}</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const accent = STAGE_ACCENT[lead.stage];
            const date = new Date(lead.createdAt).toLocaleDateString(lang, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
            return (
              <tr key={lead.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.03]">
                <td className="px-5 py-3.5 font-semibold text-alliance-light">{lead.name}</td>
                <td className="px-5 py-3.5">
                  <a href={`mailto:${lead.email}`} className="text-alliance-light/65 hover:text-alliance-yellow">
                    {lead.email}
                  </a>
                </td>
                <td className="px-5 py-3.5 text-alliance-light/65">{lead.phone || "—"}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-alliance-light/80">
                    <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                    {t(`admin.stage.${lead.stage}`)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs uppercase tracking-wide text-alliance-light/50">
                    {lead.source === "manual" ? t("admin.sourceManual") : t("admin.sourceForm")}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-alliance-light/55">{date}</td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => {
                      if (window.confirm(t("admin.deleteConfirm"))) deleteLead(lead.id);
                    }}
                    aria-label="Delete"
                    className="text-alliance-light/40 transition-colors hover:text-rose-400"
                  >
                    <HiTrash />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Stat + Add modal ---------------- */

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-alliance-gray/40 px-5 py-4">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-xl ${accent}`}>
        <Icon />
      </span>
      <div>
        <div className="font-display text-3xl leading-none text-alliance-light">{value}</div>
        <div className="mt-1 text-xs uppercase tracking-wide text-alliance-light/50">{label}</div>
      </div>
    </div>
  );
}

function AddLeadModal({ t, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addLead({ ...form, source: "manual" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-alliance-gray p-8 shadow-2xl">
        <button
          onClick={onClose}
          aria-label={t("admin.cancel")}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-lg text-alliance-light/70 transition-colors hover:bg-white/10 hover:text-alliance-light"
        >
          <HiX />
        </button>
        <h3 className="font-display text-3xl tracking-wide text-alliance-light">{t("admin.addTitle")}</h3>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <Field label={t("modal.nameLabel")} value={form.name} onChange={change("name")} required autoFocus />
          <Field label={t("modal.emailLabel")} type="email" value={form.email} onChange={change("email")} />
          <Field label={t("modal.phoneLabel")} type="tel" value={form.phone} onChange={change("phone")} />
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-alliance-light transition-colors hover:border-white/40"
            >
              {t("admin.cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full bg-alliance-yellow px-6 py-3 text-sm font-semibold text-alliance-black transition-colors hover:bg-alliance-yellow-light"
            >
              {t("admin.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-alliance-light/60">{label}</span>
      <input
        {...props}
        className="rounded-xl border border-white/10 bg-alliance-black px-4 py-3 text-sm text-alliance-light outline-none transition-colors placeholder:text-alliance-light/30 focus:border-alliance-yellow"
      />
    </label>
  );
}
