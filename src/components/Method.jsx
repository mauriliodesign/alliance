import { HiArrowRight } from "react-icons/hi";
import { TbTarget, TbListCheck, TbTrendingUp } from "react-icons/tb";
import { useLang } from "../i18n/LanguageContext";
import { useBooking } from "./BookingContext";
import { useReveal } from "../hooks/useReveal";
import SectionLabel from "./SectionLabel";

const PILLARS = [
  { icon: TbTarget, title: "method.pillar1Title", desc: "method.pillar1Desc" },
  { icon: TbListCheck, title: "method.pillar2Title", desc: "method.pillar2Desc" },
  { icon: TbTrendingUp, title: "method.pillar3Title", desc: "method.pillar3Desc" },
];

export default function Method() {
  const { t } = useLang();
  const { openBooking } = useBooking();
  const ref = useReveal();

  return (
    <section ref={ref} className="relative overflow-hidden bg-alliance-gray/40 py-24 sm:py-32">
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-alliance-yellow/5 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="reveal mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <SectionLabel>{t("method.label")}</SectionLabel>
          </div>
          <h2 className="mt-4 font-display text-4xl leading-tight text-alliance-light sm:text-5xl md:text-6xl">
            {t("method.title")}{" "}
            <span className="text-alliance-yellow">{t("method.titleHighlight")}</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-alliance-light/65 sm:text-lg">
            {t("method.p1")}
          </p>
          <p className="mt-4 text-base leading-relaxed text-alliance-light/65 sm:text-lg">
            {t("method.p2")}
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="reveal rounded-2xl border border-white/8 bg-alliance-black/60 p-8 text-center"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-alliance-yellow/10 text-3xl text-alliance-yellow">
                  <Icon />
                </span>
                <h3 className="mt-5 font-display text-2xl tracking-wide text-alliance-light">
                  {t(p.title)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-alliance-light/60">
                  {t(p.desc)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="reveal mt-12 flex justify-center">
          <button
            onClick={openBooking}
            className="group inline-flex items-center gap-2 rounded-full border border-alliance-yellow/40 px-8 py-4 text-base font-semibold text-alliance-yellow transition-all hover:bg-alliance-yellow hover:text-alliance-black"
          >
            {t("method.cta")}
            <HiArrowRight className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
