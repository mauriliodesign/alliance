import { useState } from "react";
import { HiDownload } from "react-icons/hi";
import { useLang } from "../i18n/LanguageContext";
import { useReveal } from "../hooks/useReveal";
import SectionLabel from "./SectionLabel";

// Class categories used for filtering
const CAT = { ADULT: "adult", KIDS: "kids", NOGI: "nogi" };

const DAYS = [
  { key: "monday", short: "mondayShort" },
  { key: "tuesday", short: "tuesdayShort" },
  { key: "wednesday", short: "wednesdayShort" },
  { key: "thursday", short: "thursdayShort" },
  { key: "friday", short: "fridayShort" },
  { key: "saturday", short: "saturdayShort" },
];

// Weekly schedule (Mon–Fri 07:00–21:30, Sat 10:00–12:00)
const SCHEDULE = {
  monday: [
    { time: "07:00", cat: CAT.ADULT, key: "programs.adultsTitle" },
    { time: "12:30", cat: CAT.ADULT, key: "programs.adultsTitle" },
    { time: "18:00", cat: CAT.KIDS, key: "programs.kidsTitle" },
    { time: "19:00", cat: CAT.ADULT, key: "programs.adultsTitle" },
    { time: "20:30", cat: CAT.NOGI, key: "programs.nogiTitle" },
  ],
  tuesday: [
    { time: "12:30", cat: CAT.ADULT, key: "programs.adultsTitle" },
    { time: "18:00", cat: CAT.KIDS, key: "programs.kidsTitle" },
    { time: "19:00", cat: CAT.NOGI, key: "programs.nogiTitle" },
    { time: "20:30", cat: CAT.ADULT, key: "programs.adultsTitle" },
  ],
  wednesday: [
    { time: "07:00", cat: CAT.ADULT, key: "programs.adultsTitle" },
    { time: "12:30", cat: CAT.ADULT, key: "programs.adultsTitle" },
    { time: "18:00", cat: CAT.KIDS, key: "programs.kidsTitle" },
    { time: "19:00", cat: CAT.ADULT, key: "programs.adultsTitle" },
    { time: "20:30", cat: CAT.NOGI, key: "programs.nogiTitle" },
  ],
  thursday: [
    { time: "12:30", cat: CAT.ADULT, key: "programs.adultsTitle" },
    { time: "18:00", cat: CAT.KIDS, key: "programs.kidsTitle" },
    { time: "19:00", cat: CAT.NOGI, key: "programs.nogiTitle" },
    { time: "20:30", cat: CAT.ADULT, key: "programs.adultsTitle" },
  ],
  friday: [
    { time: "07:00", cat: CAT.ADULT, key: "programs.adultsTitle" },
    { time: "12:30", cat: CAT.ADULT, key: "programs.adultsTitle" },
    { time: "19:00", cat: CAT.ADULT, key: "programs.adultsTitle" },
    { time: "20:30", cat: CAT.NOGI, key: "programs.nogiTitle" },
  ],
  saturday: [
    { time: "10:00", cat: CAT.ADULT, key: "programs.adultsTitle" },
    { time: "11:00", cat: CAT.NOGI, key: "programs.nogiTitle" },
  ],
};

const CAT_STYLES = {
  [CAT.ADULT]: "border-alliance-yellow/30 bg-alliance-yellow/10 text-alliance-yellow",
  [CAT.KIDS]: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  [CAT.NOGI]: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
};

export default function Schedule() {
  const { t } = useLang();
  const ref = useReveal();
  const [filter, setFilter] = useState("all");

  const filters = [
    { id: "all", label: "schedule.filterAll" },
    { id: CAT.ADULT, label: "schedule.filterAdult" },
    { id: CAT.KIDS, label: "schedule.filterKids" },
    { id: CAT.NOGI, label: "schedule.filterNogi" },
  ];

  const match = (cls) => filter === "all" || cls.cat === filter;

  return (
    <section id="horarios" ref={ref} className="bg-alliance-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="reveal max-w-2xl">
          <SectionLabel>{t("schedule.label")}</SectionLabel>
          <h2 className="mt-4 font-display text-4xl leading-tight text-alliance-light sm:text-5xl md:text-6xl">
            {t("schedule.title")}{" "}
            <span className="text-alliance-yellow">{t("schedule.titleHighlight")}</span>
          </h2>
          <p className="mt-4 text-lg text-alliance-light/65">{t("schedule.sub")}</p>
        </div>

        {/* Filters */}
        <div className="reveal mt-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                filter === f.id
                  ? "border-alliance-yellow bg-alliance-yellow text-alliance-black"
                  : "border-white/15 text-alliance-light/70 hover:border-alliance-yellow/50 hover:text-alliance-yellow"
              }`}
            >
              {t(f.label)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="reveal mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {DAYS.map((day) => {
            const classes = (SCHEDULE[day.key] || []).filter(match);
            return (
              <div
                key={day.key}
                className="rounded-2xl border border-white/8 bg-alliance-gray/50 p-4"
              >
                <h3 className="mb-3 border-b border-white/10 pb-3 font-display text-xl tracking-wide text-alliance-light">
                  {t(`schedule.${day.key}`)}
                </h3>
                <div className="flex flex-col gap-2">
                  {classes.length === 0 ? (
                    <p className="py-4 text-center text-xs text-alliance-light/30">
                      {t("schedule.noClasses")}
                    </p>
                  ) : (
                    classes.map((cls, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg border px-3 py-2 ${CAT_STYLES[cls.cat]}`}
                      >
                        <div className="text-sm font-bold">{cls.time}</div>
                        <div className="text-xs opacity-90">{t(cls.key)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="reveal mt-10 flex justify-center">
          <a
            href="#precos"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-alliance-light/80 transition-colors hover:border-alliance-yellow hover:text-alliance-yellow"
          >
            <HiDownload className="text-lg" />
            {t("schedule.download")}
          </a>
        </div>
      </div>
    </section>
  );
}
