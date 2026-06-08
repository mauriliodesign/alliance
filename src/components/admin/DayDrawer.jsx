import { useEffect, useMemo, useState } from "react";
import { HiX, HiPlus, HiOutlineCalendar } from "react-icons/hi";
import { useLang } from "../../i18n/LanguageContext";
import Avatar from "./Avatar";
import { STAGE_DOT } from "../../lib/format";
import { setTask } from "../../lib/leadsStore";

export default function DayDrawer({ day, leads, onClose, onOpenLead }) {
  const { t, lang } = useLang();
  const [adding, setAdding] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [text, setText] = useState("");

  const open = Boolean(day);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    setAdding(false);
    setLeadId("");
    setText("");
  }, [day]);

  const events = useMemo(
    () => (day ? leads.filter((l) => l.task?.due === day) : []),
    [leads, day]
  );

  if (!open) return null;

  const title = new Date(day + "T00:00:00").toLocaleDateString(lang, {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const submit = (e) => {
    e.preventDefault();
    if (!leadId || !text.trim()) return;
    setTask(leadId, text, day);
    setText("");
    setLeadId("");
    setAdding(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" style={{ animation: "fadeInUp 0.2s ease both" }} onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-white/10 bg-alliance-gray shadow-2xl" style={{ animation: "fadeInUp 0.3s ease both" }}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/8 px-6 py-5">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-alliance-yellow">
              <HiOutlineCalendar className="text-xs" /> {t("admin.calendar")}
            </p>
            <h2 className="mt-1 font-display text-2xl capitalize leading-tight tracking-wide text-alliance-light">{title}</h2>
          </div>
          <button onClick={onClose} aria-label={t("modal.close")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-lg text-alliance-light/70 transition-colors hover:bg-white/10 hover:text-alliance-light">
            <HiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Events of the day */}
          <ul className="flex flex-col gap-2">
            {events.length === 0 ? (
              <li className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-alliance-light/35">
                {t("admin.calEmpty")}
              </li>
            ) : (
              events.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => onOpenLead(l.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-alliance-black/50 p-3 text-left transition-colors hover:border-alliance-yellow/40"
                  >
                    <Avatar name={l.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-alliance-light">{l.name}</p>
                      <p className="truncate text-xs text-alliance-light/55">{l.task.text}</p>
                    </div>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${STAGE_DOT[l.stage]}`} />
                  </button>
                </li>
              ))
            )}
          </ul>

          {/* Add follow-up */}
          {adding ? (
            <form onSubmit={submit} className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-alliance-black/50 p-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-alliance-light/60">{t("admin.selectLead")}</span>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  required
                  className="rounded-lg border border-white/10 bg-alliance-black px-3 py-2.5 text-sm text-alliance-light outline-none focus:border-alliance-yellow"
                >
                  <option value="">—</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("admin.taskPlaceholder")}
                rows={2}
                required
                className="w-full resize-none rounded-lg border border-white/10 bg-alliance-black px-3 py-2.5 text-sm text-alliance-light outline-none placeholder:text-alliance-light/30 focus:border-alliance-yellow"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setAdding(false)} className="flex-1 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-alliance-light transition-colors hover:border-white/40">
                  {t("admin.cancel")}
                </button>
                <button type="submit" disabled={!leadId || !text.trim()} className="flex-1 rounded-full bg-alliance-yellow px-4 py-2.5 text-sm font-semibold text-alliance-black transition-colors hover:bg-alliance-yellow-light disabled:opacity-40">
                  {t("admin.save")}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-3 text-sm font-semibold text-alliance-light/70 transition-colors hover:border-alliance-yellow hover:text-alliance-yellow"
            >
              <HiPlus /> {t("admin.addFollowupBtn")}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
