import { GiBlackBelt, GiPunchBlast, GiTeacher, GiBoxingGlove } from "react-icons/gi";
import { useLang } from "../i18n/LanguageContext";
import { useReveal } from "../hooks/useReveal";
import SectionLabel from "./SectionLabel";

const PROGRAMS = [
  { icon: GiBlackBelt, title: "programs.adultsTitle", desc: "programs.adultsDesc", tag: "programs.adultsTag" },
  { icon: GiPunchBlast, title: "programs.nogiTitle", desc: "programs.nogiDesc", tag: "programs.nogiTag" },
  { icon: GiTeacher, title: "programs.privateTitle", desc: "programs.privateDesc", tag: "programs.privateTag" },
  { icon: GiBoxingGlove, title: "programs.kidsTitle", desc: "programs.kidsDesc", tag: "programs.kidsTag" },
];

export default function Programs() {
  const { t } = useLang();
  const ref = useReveal();

  return (
    <section id="programas" ref={ref} className="bg-alliance-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="reveal mb-14 max-w-2xl">
          <SectionLabel>{t("programs.label")}</SectionLabel>
          <h2 className="mt-4 font-display text-4xl leading-tight text-alliance-light sm:text-5xl md:text-6xl">
            {t("programs.title")}{" "}
            <span className="text-alliance-yellow">{t("programs.titleHighlight")}</span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {PROGRAMS.map((p, i) => {
            const Icon = p.icon;
            return (
              <article
                key={p.title}
                className="reveal group relative overflow-hidden rounded-2xl border border-white/8 bg-alliance-gray/60 p-8 transition-all duration-300 hover:border-alliance-yellow/40 hover:bg-alliance-gray"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-alliance-yellow/5 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
                <div className="relative flex items-start justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-alliance-yellow/10 text-3xl text-alliance-yellow transition-transform group-hover:scale-110">
                    <Icon />
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-alliance-light/60">
                    {t(p.tag)}
                  </span>
                </div>
                <h3 className="relative mt-6 font-display text-2xl tracking-wide text-alliance-light sm:text-3xl">
                  {t(p.title)}
                </h3>
                <p className="relative mt-3 text-base leading-relaxed text-alliance-light/65">
                  {t(p.desc)}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
