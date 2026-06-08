import { useMemo, useState } from "react";
import { HiChevronLeft, HiChevronRight, HiOutlineCalendar, HiPlus } from "react-icons/hi";
import { useLang } from "../../i18n/LanguageContext";
import { STAGE_DOT } from "../../lib/format";

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function startOfWeekMon(date) {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Calendar({ leads, onOpen, onDayClick }) {
  const { t, lang } = useLang();
  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(() => new Date());

  const today = new Date();
  const todayStr = ymd(today);

  // Group lead follow-ups/appointments by day
  const eventsByDay = useMemo(() => {
    const map = {};
    leads.forEach((l) => {
      if (l.task?.due) (map[l.task.due] ||= []).push(l);
    });
    return map;
  }, [leads]);

  const days = useMemo(() => {
    if (view === "week") {
      const start = startOfWeekMon(cursor);
      return [...Array(7)].map((_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = startOfWeekMon(first);
    return [...Array(42)].map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [view, cursor]);

  const weekdays = useMemo(() => {
    const start = startOfWeekMon(new Date());
    return [...Array(7)].map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toLocaleDateString(lang, { weekday: "short" });
    });
  }, [lang]);

  const go = (dir) => {
    const d = new Date(cursor);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    setCursor(d);
  };

  const label =
    view === "month"
      ? cursor.toLocaleDateString(lang, { month: "long", year: "numeric" })
      : (() => {
          const s = startOfWeekMon(cursor);
          const e = new Date(s);
          e.setDate(s.getDate() + 6);
          const opt = { day: "2-digit", month: "short" };
          return `${s.toLocaleDateString(lang, opt)} – ${e.toLocaleDateString(lang, opt)}`;
        })();

  return (
    <section className="rounded-2xl border border-white/8 bg-alliance-gray/40 p-5 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl capitalize tracking-wide text-alliance-light">{label}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-alliance-light/40">
            <HiOutlineCalendar className="text-xs" /> {t("admin.gcalSoon")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* view toggle */}
          <div className="flex rounded-full border border-white/10 p-0.5">
            {["week", "month"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  view === v ? "bg-alliance-yellow text-alliance-black" : "text-alliance-light/60 hover:text-alliance-light"
                }`}
              >
                {v === "week" ? t("admin.calWeek") : t("admin.calMonth")}
              </button>
            ))}
          </div>
          <button onClick={() => setCursor(new Date())} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-alliance-light/70 transition-colors hover:border-alliance-yellow hover:text-alliance-yellow">
            {t("admin.calToday")}
          </button>
          <button onClick={() => go(-1)} aria-label="prev" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-alliance-light/70 transition-colors hover:border-alliance-yellow hover:text-alliance-yellow">
            <HiChevronLeft />
          </button>
          <button onClick={() => go(1)} aria-label="next" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-alliance-light/70 transition-colors hover:border-alliance-yellow hover:text-alliance-yellow">
            <HiChevronRight />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1.5">
        {weekdays.map((w) => (
          <div key={w} className="px-1 pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-alliance-light/35">
            {w}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const key = ymd(d);
          const inMonth = view === "week" || d.getMonth() === cursor.getMonth();
          const isToday = key === todayStr;
          const events = eventsByDay[key] || [];
          const max = view === "week" ? 20 : 3;
          return (
            <div
              key={key}
              onClick={() => onDayClick?.(key)}
              className={`group flex cursor-pointer flex-col rounded-lg border p-1.5 transition-colors hover:border-white/20 ${view === "week" ? "min-h-64" : "min-h-24"} ${
                isToday ? "border-alliance-yellow/50 bg-alliance-yellow/[0.06]" : "border-white/5"
              } ${inMonth ? "" : "opacity-35"}`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className={`text-xs ${isToday ? "font-bold text-alliance-yellow" : "text-alliance-light/55"}`}>{d.getDate()}</span>
                <HiPlus className="text-xs text-alliance-light/0 transition-colors group-hover:text-alliance-light/40" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                {events.slice(0, max).map((l) => {
                  const overdue = l.task.due < todayStr;
                  return (
                    <button
                      key={l.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpen(l.id);
                      }}
                      title={`${l.name} — ${l.task.text}`}
                      className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] transition-colors hover:bg-white/10"
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STAGE_DOT[l.stage]}`} />
                      <span className={`truncate ${overdue ? "text-rose-400" : "text-alliance-light/75"}`}>
                        {view === "week" ? `${l.name} · ${l.task.text}` : l.name}
                      </span>
                    </button>
                  );
                })}
                {events.length > max && (
                  <span className="px-1 text-[10px] text-alliance-light/40">+{events.length - max}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
