import { useEffect, useMemo, useState } from "react";
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
  HiOutlineChat,
  HiDownload,
  HiOutlineCalendar,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { useLang } from "../i18n/LanguageContext";
import { useToast } from "../components/ToastContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Sidebar from "../components/admin/Sidebar";
import LeadDrawer from "../components/admin/LeadDrawer";
import Calendar from "../components/admin/Calendar";
import Avatar from "../components/admin/Avatar";
import { useLeads } from "../hooks/useLeads";
import { STAGES, addLead, moveLead, deleteLead, restoreLead, isOverdue, isDueToday } from "../lib/leadsStore";
import { timeAgo, exportLeadsCsv, STAGE_DOT, TAG_SUGGESTIONS } from "../lib/format";

const DAY = 86400000;

const lastActivity = (l) => {
  let ts = l.createdAt;
  (l.followups || []).forEach((n) => (ts = Math.max(ts, n.createdAt)));
  (l.activity || []).forEach((a) => (ts = Math.max(ts, a.createdAt)));
  return ts;
};
const taskPending = (l) => l.task && (isOverdue(l.task.due) || isDueToday(l.task.due));

export default function Admin() {
  const { t, lang } = useLang();
  const { showToast } = useToast();
  const leads = useLeads();
  const [view, setView] = useState("pipeline");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const selectedLead = useMemo(() => leads.find((l) => l.id === selectedId) || null, [leads, selectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.phone || "").toLowerCase().includes(q) ||
        (l.tags || []).some((tag) => tag.includes(q))
    );
  }, [leads, query]);

  const total = leads.length;
  const won = leads.filter((l) => l.stage === "won").length;
  const lost = leads.filter((l) => l.stage === "lost").length;
  const conversion = won + lost ? Math.round((won / (won + lost)) * 100) : 0;
  const dueCount = leads.filter(taskPending).length;

  const removeWithUndo = (lead) => {
    deleteLead(lead.id);
    if (selectedId === lead.id) setSelectedId(null);
    showToast({ message: t("admin.leadRemoved"), actionLabel: t("admin.undo"), onAction: () => restoreLead(lead) });
  };

  const titles = { overview: t("admin.navOverview"), pipeline: t("admin.navPipeline"), contacts: t("admin.navContacts") };

  return (
    <div className="min-h-screen bg-alliance-black">
      <Sidebar view={view} setView={setView} open={sidebarOpen} onClose={() => setSidebarOpen(false)} dueCount={dueCount} />

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-white/8 bg-alliance-black/90 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} aria-label={t("admin.menu")} className="text-2xl text-alliance-light lg:hidden">
                <HiMenu />
              </button>
              <div>
                <h1 className="font-display text-2xl leading-none tracking-wide text-alliance-light">{titles[view]}</h1>
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
          {view === "overview" ? (
            <Overview leads={leads} t={t} lang={lang} stats={{ total, won, conversion, dueCount }} onOpen={setSelectedId} />
          ) : (
            <>
              {/* Stats */}
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <Stat icon={HiUsers} label={t("admin.total")} value={total} accent="text-alliance-yellow" />
                <Stat icon={HiBadgeCheck} label={t("admin.enrolled")} value={won} accent="text-emerald-300" />
                <Stat icon={HiTrendingUp} label={t("admin.conversion")} value={`${conversion}%`} accent="text-sky-300" />
              </div>

              {/* Toolbar */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl tracking-wide text-alliance-light/80">{titles[view]}</h2>
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center sm:w-64">
                    <HiSearch className="pointer-events-none absolute left-4 text-lg text-alliance-light/40" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t("admin.search")}
                      className="w-full rounded-xl border border-white/10 bg-alliance-gray px-4 py-2.5 pl-11 text-sm text-alliance-light outline-none transition-colors placeholder:text-alliance-light/30 focus:border-alliance-yellow"
                    />
                  </div>
                  <button
                    onClick={() => exportLeadsCsv(filtered, t)}
                    title={t("admin.export")}
                    className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-alliance-light/70 transition-colors hover:border-alliance-yellow hover:text-alliance-yellow"
                  >
                    <HiDownload className="text-lg" />
                    <span className="hidden md:inline">CSV</span>
                  </button>
                </div>
              </div>

              {view === "pipeline" ? (
                <KanbanBoard leads={filtered} t={t} lang={lang} onSelect={setSelectedId} onDelete={removeWithUndo} />
              ) : (
                <ContactsTable leads={filtered} t={t} lang={lang} onSelect={setSelectedId} onDelete={removeWithUndo} />
              )}
            </>
          )}
        </main>
      </div>

      {adding && <AddLeadModal t={t} onClose={() => setAdding(false)} />}
      <LeadDrawer lead={selectedLead} onClose={() => setSelectedId(null)} />
    </div>
  );
}

/* ---------------- Overview ---------------- */

function Overview({ leads, t, stats, onOpen }) {
  const thisWeek = leads.filter((l) => Date.now() - l.createdAt < 7 * DAY).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={HiUsers} label={t("admin.total")} value={stats.total} />
        <Stat icon={HiPlus} label={t("admin.leadsThisWeek")} value={thisWeek} />
        <Stat icon={HiOutlineCalendar} label={t("admin.openTasks")} value={stats.dueCount} />
        <Stat icon={HiTrendingUp} label={t("admin.conversion")} value={`${stats.conversion}%`} />
      </div>

      <Calendar leads={leads} onOpen={onOpen} />
    </div>
  );
}

/* ---------------- Kanban ---------------- */

function KanbanBoard({ leads, t, lang, onSelect, onDelete }) {
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
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${STAGE_DOT[stage]}`} />
                <span className="text-sm font-semibold text-alliance-light/90">{t(`admin.stage.${stage}`)}</span>
              </div>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-bold text-alliance-light/50">{items.length}</span>
            </div>

            <div className="flex min-h-24 flex-1 flex-col gap-2.5 p-3 pt-0">
              {items.length === 0 ? (
                <p className="py-8 text-center text-xs text-alliance-light/25">{t("admin.empty")}</p>
              ) : (
                items.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    lang={lang}
                    t={t}
                    dragging={dragId === lead.id}
                    onOpen={() => onSelect(lead.id)}
                    onDragStart={() => setDragId(lead.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverStage(null);
                    }}
                    onDelete={() => onDelete(lead)}
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

function LeadCard({ lead, lang, t, dragging, onOpen, onDragStart, onDragEnd, onDelete }) {
  const stop = (e) => e.stopPropagation();
  const followups = lead.followups?.length || 0;
  const wa = (lead.phone || "").replace(/\D/g, "");
  const due = lead.task?.due;
  const overdue = due && isOverdue(due);

  return (
    <article
      draggable
      onClick={onOpen}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group relative cursor-pointer rounded-xl border border-white/8 bg-alliance-black p-3.5 transition-colors hover:border-white/20 active:cursor-grabbing ${
        dragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Avatar name={lead.name} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-alliance-light">{lead.name}</h3>
          <p className="truncate text-xs text-alliance-light/45">{lead.email}</p>
        </div>
      </div>

      {/* Hover quick actions */}
      <div className="absolute right-2.5 top-2.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {wa && (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" onClick={stop} aria-label="WhatsApp" className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-alliance-light/50 transition-colors hover:text-alliance-light">
            <FaWhatsapp className="text-sm" />
          </a>
        )}
        <button onClick={(e) => { stop(e); onDelete(); }} aria-label="Delete" className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-alliance-light/50 transition-colors hover:text-rose-400">
          <HiTrash className="text-sm" />
        </button>
      </div>

      {/* Tags */}
      {lead.tags?.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {lead.tags.slice(0, 3).map((tg) => (
            <span key={tg} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-alliance-light/50">#{tg}</span>
          ))}
        </div>
      )}

      {/* Task — only the due text; red only when overdue */}
      {due && (
        <div className={`mt-2.5 flex items-center gap-1.5 text-[11px] ${overdue ? "text-rose-400" : "text-alliance-light/50"}`}>
          <HiOutlineCalendar className="shrink-0 text-xs" />
          <span className="truncate">{lead.task.text}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-end gap-3 border-t border-white/5 pt-2.5 text-[10px] text-alliance-light/35">
        {followups > 0 && (
          <span className="inline-flex items-center gap-0.5">
            <HiOutlineChat className="text-xs" />
            {followups}
          </span>
        )}
        <span>{timeAgo(lastActivity(lead), lang)}</span>
      </div>
    </article>
  );
}

/* ---------------- Contacts table ---------------- */

function ContactsTable({ leads, t, lang, onSelect, onDelete }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-white/8 bg-alliance-gray/40 py-20 text-center text-sm text-alliance-light/40">
        {t("admin.empty")}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/8 bg-alliance-gray/40">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/8 text-xs uppercase tracking-wide text-alliance-light/45">
            <th className="px-5 py-3.5 font-semibold">{t("admin.colName")}</th>
            <th className="px-5 py-3.5 font-semibold">{t("modal.emailLabel")}</th>
            <th className="px-5 py-3.5 font-semibold">{t("modal.phoneLabel")}</th>
            <th className="px-5 py-3.5 font-semibold">{t("admin.colStage")}</th>
            <th className="px-5 py-3.5 font-semibold">{t("admin.sourceLabel")}</th>
            <th className="px-5 py-3.5 font-semibold">{t("admin.colDate")}</th>
            <th className="px-5 py-3.5 text-right font-semibold">{t("admin.colActions")}</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            return (
              <tr key={lead.id} onClick={() => onSelect(lead.id)} className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/[0.03]">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={lead.name} size="sm" />
                    <span className="font-semibold text-alliance-light">{lead.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="text-alliance-light/65 hover:text-alliance-yellow">{lead.email}</a>
                </td>
                <td className="px-5 py-3.5 text-alliance-light/65">{lead.phone || "—"}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-alliance-light/80">
                    <span className={`h-1.5 w-1.5 rounded-full ${STAGE_DOT[lead.stage]}`} />
                    {t(`admin.stage.${lead.stage}`)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs uppercase tracking-wide text-alliance-light/50">{lead.source === "manual" ? t("admin.sourceManual") : t("admin.sourceForm")}</span>
                </td>
                <td className="px-5 py-3.5 text-alliance-light/55">{timeAgo(lead.createdAt, lang)}</td>
                <td className="px-5 py-3.5 text-right">
                  <button onClick={(e) => { e.stopPropagation(); onDelete(lead); }} aria-label="Delete" className="text-alliance-light/40 transition-colors hover:text-rose-400">
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

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-alliance-gray/40 px-5 py-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-xl text-alliance-light/40">
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
  const [form, setForm] = useState({ name: "", email: "", phone: "", instagram: "", tags: [] });
  const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleTag = (tag) =>
    setForm((f) => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter((x) => x !== tag) : [...f.tags, tag] }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addLead({ ...form, instagram: form.instagram.trim().replace(/^@/, ""), source: "manual" });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" style={{ animation: "fadeInUp 0.2s ease both" }} onClick={onClose} />
      <aside
        className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-white/10 bg-alliance-gray shadow-2xl"
        style={{ animation: "fadeInUp 0.3s ease both" }}
      >
        <div className="flex items-start justify-between border-b border-white/8 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-alliance-yellow">{t("admin.sourceManual")}</p>
            <h2 className="mt-1 font-display text-3xl leading-none tracking-wide text-alliance-light">{t("admin.addTitle")}</h2>
          </div>
          <button onClick={onClose} aria-label={t("admin.cancel")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-lg text-alliance-light/70 transition-colors hover:bg-white/10 hover:text-alliance-light">
            <HiX />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-4">
            <Field label={t("modal.nameLabel")} value={form.name} onChange={change("name")} placeholder={t("modal.namePlaceholder")} required autoFocus />
            <Field label={t("modal.emailLabel")} type="email" value={form.email} onChange={change("email")} placeholder={t("modal.emailPlaceholder")} />
            <Field label={t("modal.phoneLabel")} type="tel" value={form.phone} onChange={change("phone")} placeholder={t("modal.phonePlaceholder")} />
            <Field label={t("admin.instagram")} value={form.instagram} onChange={change("instagram")} placeholder="@instagram" />
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-alliance-light/60">{t("admin.tags")}</span>
              <div className="flex flex-wrap gap-2">
                {TAG_SUGGESTIONS.map((tg) => {
                  const on = form.tags.includes(tg);
                  return (
                    <button
                      key={tg}
                      type="button"
                      onClick={() => toggleTag(tg)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        on ? "border-alliance-yellow bg-alliance-yellow/15 text-alliance-yellow" : "border-white/15 text-alliance-light/55 hover:border-white/30"
                      }`}
                    >
                      {tg}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-auto flex gap-3 pt-8">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-alliance-light transition-colors hover:border-white/40">
              {t("admin.cancel")}
            </button>
            <button type="submit" className="flex-1 rounded-full bg-alliance-yellow px-6 py-3 text-sm font-semibold text-alliance-black transition-colors hover:bg-alliance-yellow-light">
              {t("admin.save")}
            </button>
          </div>
        </form>
      </aside>
    </>
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
