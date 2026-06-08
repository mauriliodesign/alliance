import { useLang } from "../i18n/LanguageContext";
import { useReveal } from "../hooks/useReveal";
import SectionLabel from "./SectionLabel";

const STATS = [
  { title: "coach.stat1Title", sub: "coach.stat1Sub" },
  { title: "coach.stat2Title", sub: "coach.stat2Sub" },
  { title: "coach.stat3Title", sub: "coach.stat3Sub" },
];

export default function Coach() {
  const { t } = useLang();
  const ref = useReveal();

  return (
    <section id="equipa" ref={ref} className="bg-alliance-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="reveal relative">
            <div className="relative overflow-hidden rounded-3xl border border-white/10">
              <img
                src="/images/rafa.webp"
                alt={t("coach.name")}
                className="aspect-[4/5] w-full object-cover object-top"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-alliance-black/70 via-transparent to-transparent" />
            </div>
            {/* Years badge */}
            <div className="absolute -bottom-6 -right-2 sm:right-6 rounded-2xl border border-alliance-yellow/30 bg-alliance-yellow px-6 py-4 text-center text-alliance-black shadow-2xl">
              <div className="font-display text-4xl leading-none">{t("coach.badgeYears")}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide leading-tight">
                {t("coach.badgeLabel1")}
                <br />
                {t("coach.badgeLabel2")}
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="reveal" style={{ transitionDelay: "120ms" }}>
            <SectionLabel>{t("coach.label")}</SectionLabel>
            <h2 className="mt-4 font-display text-4xl leading-tight text-alliance-light sm:text-5xl">
              {t("coach.title")}{" "}
              <span className="text-alliance-yellow">{t("coach.titleHighlight")}</span>
            </h2>
            <p className="mt-6 text-lg font-semibold text-alliance-light">{t("coach.name")}</p>
            <p className="mt-3 text-base leading-relaxed text-alliance-light/65">
              {t("coach.bio1")}
            </p>
            <p className="mt-4 text-base leading-relaxed text-alliance-light/65">
              {t("coach.bio2")}
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
              {STATS.map((s) => (
                <div key={s.title}>
                  <div className="font-display text-xl tracking-wide text-alliance-yellow sm:text-2xl">
                    {t(s.title)}
                  </div>
                  <div className="mt-1 text-xs leading-snug text-alliance-light/55">
                    {t(s.sub)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
