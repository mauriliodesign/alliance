import { useEffect, useMemo, useRef, useState } from "react";
import {
  HiX,
  HiOutlineMail,
  HiOutlinePhone,
  HiTrash,
  HiOutlineClock,
  HiOutlineChat,
  HiPencil,
  HiCheck,
  HiPlus,
  HiArrowRight,
  HiSparkles,
  HiOutlineCalendar,
  HiOutlineStar,
  HiChevronDown,
} from "react-icons/hi";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useLang } from "../../i18n/LanguageContext";
import { useToast } from "../ToastContext";
import Avatar from "./Avatar";
import { timeAgo, STAGE_DOT, INTEREST_OPTS, interestKey, TAG_SUGGESTIONS } from "../../lib/format";
import {
  STAGES,
  moveLead,
  addNote,
  deleteNote,
  setTask,
  clearTask,
  addTag,
  removeTag,
  updateLead,
  deleteLead,
  restoreLead,
  isOverdue,
  isDueToday,
} from "../../lib/leadsStore";

export default function LeadDrawer({ lead, onClose }) {
  const { t, lang } = useLang();
  const { showToast } = useToast();
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", interest: "", instagram: "" });
  const [tag, setTag] = useState("");
  const [taskForm, setTaskForm] = useState({ text: "", due: "" });

  const open = Boolean(lead);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    setEditing(false);
    setNote("");
    setTag("");
    setTaskForm({ text: "", due: "" });
    if (lead) setForm({ name: lead.name, email: lead.email || "", phone: lead.phone || "", interest: lead.interest || "", instagram: lead.instagram || "" });
  }, [lead?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const timeline = useMemo(() => {
    if (!lead) return [];
    const notes = (lead.followups || []).map((n) => ({ ...n, kind: "note" }));
    const acts = (lead.activity || []).map((a) => ({ ...a, kind: a.type }));
    return [...notes, ...acts].sort((a, b) => b.createdAt - a.createdAt);
  }, [lead]);

  const fmt = (ts) =>
    new Date(ts).toLocaleDateString(lang, { day: "2-digit", month: "short", year: "numeric" });

  if (!open) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[60] bg-black/0 transition-opacity" />
    );
  }

  const submitNote = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    addNote(lead.id, note);
    setNote("");
  };

  const saveEdit = () => {
    if (!form.name.trim()) return;
    updateLead(lead.id, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      interest: form.interest,
      instagram: form.instagram.trim().replace(/^@/, ""),
    });
    setEditing(false);
  };

  const submitTask = (e) => {
    e.preventDefault();
    if (!taskForm.text.trim() || !taskForm.due) return;
    setTask(lead.id, taskForm.text, taskForm.due);
    setTaskForm({ text: "", due: "" });
  };

  const removeWithUndo = () => {
    const snapshot = lead;
    deleteLead(lead.id);
    onClose();
    showToast({
      message: t("admin.leadRemoved"),
      actionLabel: t("admin.undo"),
      onAction: () => restoreLead(snapshot),
    });
  };

  const dueState = lead.task ? (isOverdue(lead.task.due) ? "overdue" : isDueToday(lead.task.due) ? "today" : "ok") : null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
        style={{ animation: "fadeInUp 0.2s ease both" }}
      />
      <aside
        className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-white/10 bg-alliance-gray shadow-2xl"
        style={{ animation: "fadeInUp 0.3s ease both" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/8 px-6 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={lead.name} size="lg" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-alliance-yellow">
                {t("admin.details")}
              </p>
              {editing ? (
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-alliance-black px-2 py-1 font-display text-2xl tracking-wide text-alliance-light outline-none focus:border-alliance-yellow"
                />
              ) : (
                <h2 className="truncate font-display text-3xl leading-none tracking-wide text-alliance-light">
                  {lead.name}
                </h2>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t("modal.close")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-lg text-alliance-light/70 transition-colors hover:bg-white/10 hover:text-alliance-light"
          >
            <HiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Quick contact actions */}
          <div className="flex gap-2">
            <a
              href={`https://wa.me/${(lead.phone || "").replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-alliance-light/80 transition-colors hover:border-whatsapp hover:text-whatsapp"
            >
              <FaWhatsapp /> WhatsApp
            </a>
            <a
              href={`tel:${(lead.phone || "").replace(/\s/g, "")}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-alliance-light/80 transition-colors hover:border-alliance-yellow hover:text-alliance-yellow"
            >
              <HiOutlinePhone /> {t("admin.callAction")}
            </a>
            <a
              href={`mailto:${lead.email}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-alliance-light/80 transition-colors hover:border-alliance-yellow hover:text-alliance-yellow"
            >
              <HiOutlineMail /> {t("admin.emailAction")}
            </a>
          </div>

          {/* Stage selector */}
          <div className="mt-6">
            <StageDropdown stage={lead.stage} onChange={(s) => moveLead(lead.id, s)} t={t} />
          </div>

          {/* Contact info (with inline edit) */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-alliance-light/40">
                {t("admin.contactInfo")}
              </p>
              {editing ? (
                <button onClick={saveEdit} className="flex items-center gap-1 text-xs font-semibold text-alliance-yellow">
                  <HiCheck /> {t("admin.save")}
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-xs font-medium text-alliance-light/50 transition-colors hover:text-alliance-yellow"
                >
                  <HiPencil /> {t("admin.edit")}
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-alliance-black/50 p-4">
              {editing ? (
                <>
                  <EditField icon={HiOutlineMail} type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder={t("modal.emailPlaceholder")} />
                  <EditField icon={HiOutlinePhone} type="tel" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder={t("modal.phonePlaceholder")} />
                  <EditField icon={FaInstagram} value={form.instagram} onChange={(v) => setForm((f) => ({ ...f, instagram: v }))} placeholder="@instagram" />
                  <div className="flex items-center gap-3">
                    <HiOutlineStar className="shrink-0 text-lg text-alliance-light/40" />
                    <select
                      value={form.interest}
                      onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))}
                      className="w-full rounded-lg border border-white/10 bg-alliance-black px-3 py-2 text-sm text-alliance-light outline-none focus:border-alliance-yellow"
                    >
                      <option value="">{t("admin.interestSelect")}</option>
                      {INTEREST_OPTS.map((o) => (
                        <option key={o.value} value={o.value}>{t(o.label)}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-sm text-alliance-light/75 transition-colors hover:text-alliance-yellow">
                    <HiOutlineMail className="shrink-0 text-lg text-alliance-light/40" />
                    <span className="truncate">{lead.email || "—"}</span>
                  </a>
                  <a href={`tel:${(lead.phone || "").replace(/\s/g, "")}`} className="flex items-center gap-3 text-sm text-alliance-light/75 transition-colors hover:text-alliance-yellow">
                    <HiOutlinePhone className="shrink-0 text-lg text-alliance-light/40" />
                    {lead.phone || "—"}
                  </a>
                  {lead.instagram && (
                    <a href={`https://instagram.com/${lead.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-alliance-light/75 transition-colors hover:text-alliance-yellow">
                      <FaInstagram className="shrink-0 text-lg text-alliance-light/40" />
                      @{lead.instagram.replace(/^@/, "")}
                    </a>
                  )}
                  {lead.interest && (
                    <div className="flex items-center gap-3 text-sm text-alliance-light/75">
                      <HiOutlineStar className="shrink-0 text-lg text-alliance-light/40" />
                      {t("admin.interest")}: {t(interestKey(lead.interest))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-alliance-light/55">
                    <HiOutlineClock className="shrink-0 text-lg text-alliance-light/40" />
                    {t("admin.created")} {fmt(lead.createdAt)}
                    <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-alliance-light/45">
                      {lead.source === "manual" ? t("admin.sourceManual") : t("admin.sourceForm")}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-6">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-alliance-light/40">
              {t("admin.tags")}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {(lead.tags || []).map((tg) => (
                <span key={tg} className="inline-flex items-center gap-1.5 rounded-full bg-alliance-yellow/10 px-3 py-1 text-xs font-medium text-alliance-yellow">
                  {tg}
                  <button onClick={() => removeTag(lead.id, tg)} aria-label="remove" className="opacity-60 hover:opacity-100">
                    <HiX className="text-xs" />
                  </button>
                </span>
              ))}
              {TAG_SUGGESTIONS.filter((s) => !(lead.tags || []).includes(s)).map((s) => (
                <button
                  key={s}
                  onClick={() => addTag(lead.id, s)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-white/15 px-3 py-1 text-xs text-alliance-light/45 transition-colors hover:border-alliance-yellow/50 hover:text-alliance-yellow"
                >
                  <HiPlus className="text-xs" /> {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (tag.trim()) addTag(lead.id, tag);
                setTag("");
              }}
              className="mt-2"
            >
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder={t("admin.addTag")}
                className="w-full rounded-lg border border-white/10 bg-alliance-black px-3 py-2 text-xs text-alliance-light outline-none placeholder:text-alliance-light/30 focus:border-alliance-yellow"
              />
            </form>
          </div>

          {/* Next follow-up task */}
          <div className="mt-6">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-alliance-light/40">
              <HiOutlineCalendar className="text-sm" /> {t("admin.task")}
            </p>
            {lead.task ? (
              <div
                className={`flex items-start justify-between gap-3 rounded-2xl border p-4 ${
                  dueState === "overdue" ? "border-rose-500/40 bg-rose-500/5" : "border-white/8 bg-alliance-black/50"
                }`}
              >
                <div>
                  <p className="text-sm text-alliance-light/85">{lead.task.text}</p>
                  <p className={`mt-1 text-xs font-medium ${dueState === "overdue" ? "text-rose-400" : "text-alliance-light/50"}`}>
                    {dueState === "overdue" ? `${t("admin.overdue")} · ` : dueState === "today" ? `${t("admin.dueToday")} · ` : ""}
                    {fmt(new Date(lead.task.due).getTime())}
                  </p>
                </div>
                <button
                  onClick={() => clearTask(lead.id)}
                  className="flex shrink-0 items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-alliance-light/80 transition-colors hover:bg-emerald-400/15 hover:text-emerald-300"
                >
                  <HiCheck /> {t("admin.taskDone")}
                </button>
              </div>
            ) : (
              <form onSubmit={submitTask} className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-alliance-black/50 p-4">
                <input
                  value={taskForm.text}
                  onChange={(e) => setTaskForm((f) => ({ ...f, text: e.target.value }))}
                  placeholder={t("admin.taskPlaceholder")}
                  className="w-full rounded-lg border border-white/10 bg-alliance-black px-3 py-2 text-sm text-alliance-light outline-none placeholder:text-alliance-light/30 focus:border-alliance-yellow"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={taskForm.due}
                    onChange={(e) => setTaskForm((f) => ({ ...f, due: e.target.value }))}
                    className="flex-1 rounded-lg border border-white/10 bg-alliance-black px-3 py-2 text-sm text-alliance-light outline-none focus:border-alliance-yellow"
                  />
                  <button
                    type="submit"
                    disabled={!taskForm.text.trim() || !taskForm.due}
                    className="rounded-lg bg-alliance-yellow px-4 py-2 text-sm font-semibold text-alliance-black transition-colors hover:bg-alliance-yellow-light disabled:opacity-40"
                  >
                    {t("admin.taskSet")}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Activity timeline */}
          <div className="mt-6">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-alliance-light/40">
              <HiOutlineChat className="text-sm" /> {t("admin.activity")}
            </p>

            <form onSubmit={submitNote} className="flex flex-col gap-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("admin.followupPlaceholder")}
                rows={2}
                className="w-full resize-none rounded-xl border border-white/10 bg-alliance-black px-4 py-3 text-sm text-alliance-light outline-none transition-colors placeholder:text-alliance-light/30 focus:border-alliance-yellow"
              />
              <button
                type="submit"
                disabled={!note.trim()}
                className="self-end rounded-full bg-alliance-yellow px-5 py-2 text-sm font-semibold text-alliance-black transition-colors hover:bg-alliance-yellow-light disabled:opacity-40"
              >
                {t("admin.followupAdd")}
              </button>
            </form>

            <ul className="mt-4 flex flex-col gap-3">
              {timeline.map((item) => (
                <TimelineItem key={item.id} item={item} t={t} lang={lang} onDeleteNote={() => deleteNote(lead.id, item.id)} />
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/8 px-6 py-4">
          <button
            onClick={removeWithUndo}
            className="inline-flex items-center gap-2 text-sm font-medium text-rose-400/80 transition-colors hover:text-rose-400"
          >
            <HiTrash /> {t("admin.deleteLead")}
          </button>
        </div>
      </aside>
    </>
  );
}

function StageDropdown({ stage, onChange, t }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-alliance-black px-4 py-3 text-sm text-alliance-light transition-colors hover:border-white/25"
      >
        <span className={`h-2 w-2 rounded-full ${STAGE_DOT[stage]}`} />
        <span className="font-medium">{t(`admin.stage.${stage}`)}</span>
        <HiChevronDown className={`ml-auto text-base text-alliance-light/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-alliance-gray shadow-2xl">
          {STAGES.map((s) => {
            const active = s === stage;
            return (
              <li key={s}>
                <button
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                    active ? "text-alliance-yellow" : "text-alliance-light/75"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${STAGE_DOT[s]}`} />
                  {t(`admin.stage.${s}`)}
                  {active && <HiCheck className="ml-auto text-base" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function EditField({ icon: Icon, value, onChange, ...props }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="shrink-0 text-lg text-alliance-light/40" />
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-alliance-black px-3 py-2 text-sm text-alliance-light outline-none placeholder:text-alliance-light/30 focus:border-alliance-yellow"
      />
    </div>
  );
}

function TimelineItem({ item, t, lang, onDeleteNote }) {
  const when = timeAgo(item.createdAt, lang);

  if (item.kind === "note") {
    return (
      <li className="group relative rounded-xl border border-white/8 bg-alliance-black/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-alliance-light/40">{when}</span>
          <button onClick={onDeleteNote} aria-label="Delete" className="text-alliance-light/30 opacity-0 transition-all hover:text-rose-400 group-hover:opacity-100">
            <HiTrash className="text-xs" />
          </button>
        </div>
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-alliance-light/80">{item.text}</p>
      </li>
    );
  }

  const meta = {
    created: { icon: HiSparkles, color: "text-alliance-light/45", label: t("admin.actCreated") },
    stage: { icon: HiArrowRight, color: "text-alliance-light/45", label: `${t("admin.actStageTo")} ${t(`admin.stage.${item.to}`)}` },
    task: { icon: HiOutlineCalendar, color: "text-alliance-light/45", label: `${t("admin.actTaskSet")}: ${item.text}` },
  }[item.kind] || { icon: HiOutlineChat, color: "text-alliance-light/45", label: item.text || "" };

  const Icon = meta.icon;
  return (
    <li className="flex items-center gap-3 px-1">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 ${meta.color}`}>
        <Icon className="text-sm" />
      </span>
      <span className="text-sm text-alliance-light/70">{meta.label}</span>
      <span className="ml-auto text-[10px] uppercase tracking-wide text-alliance-light/35">{when}</span>
    </li>
  );
}
