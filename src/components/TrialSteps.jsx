import { HiArrowRight } from "react-icons/hi";
import { useLang } from "../i18n/LanguageContext";
import { useBooking } from "./BookingContext";
import { useReveal } from "../hooks/useReveal";
import SectionLabel from "./SectionLabel";

const STEPS = [
  { title: "trial.step1Title", desc: "trial.step1Desc" },
  { title: "trial.step2Title", desc: "trial.step2Desc" },
  { title: "trial.step3Title", desc: "trial.step3Desc" },
  { title: "trial.step4Title", desc: "trial.step4Desc" },
];

export default function TrialSteps() {
  const { t } = useLang();
  const { openBooking } = useBooking();
  const ref = useReveal();

  return (
    <section id="aula-experimental" ref={ref} className="bg-alliance-gray/40 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="reveal mb-14 max-w-2xl">
          <SectionLabel>{t("trial.label")}</SectionLabel>
          <h2 className="mt-4 font-display text-4xl leading-tight text-alliance-light sm:text-5xl md:text-6xl">
            {t("trial.title1")}{" "}
            <span className="text-alliance-yellow">{t("trial.title2")}</span>
          </h2>
          <p className="mt-4 text-lg text-alliance-light/65">{t("trial.sub")}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="reveal relative rounded-2xl border border-white/8 bg-alliance-black/60 p-7"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="font-display text-5xl text-alliance-yellow/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-alliance-light/40">
                  {t("trial.step")} {i + 1}
                </span>
              </div>
              <h3 className="font-display text-2xl tracking-wide text-alliance-light">
                {t(step.title)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-alliance-light/60">
                {t(step.desc)}
              </p>
            </div>
          ))}
        </div>

        <div className="reveal mt-12 flex justify-center">
          <button
            onClick={openBooking}
            className="group inline-flex items-center gap-2 rounded-full bg-alliance-yellow px-8 py-4 text-base font-semibold text-alliance-black transition-all hover:scale-105 hover:bg-alliance-yellow-light"
          >
            {t("trial.cta")}
            <HiArrowRight className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
