import { useLang } from "../i18n/LanguageContext";
import { useReveal } from "../hooks/useReveal";
import SectionLabel from "./SectionLabel";

const PROGRAMS = [
  { img: "/images/prog-adults.webp", title: "programs.adultsTitle", desc: "programs.adultsDesc", tag: "programs.adultsTag" },
  { img: "/images/prog-nogi.webp", title: "programs.nogiTitle", desc: "programs.nogiDesc", tag: "programs.nogiTag" },
  { img: "/images/prog-private.webp", title: "programs.privateTitle", desc: "programs.privateDesc", tag: "programs.privateTag" },
  { img: "/images/prog-kids.webp", title: "programs.kidsTitle", desc: "programs.kidsDesc", tag: "programs.kidsTag" },
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
          {PROGRAMS.map((p, i) => (
            <article
              key={p.title}
              className="reveal group overflow-hidden rounded-2xl border border-white/8 bg-alliance-gray/60 transition-all duration-300 hover:border-alliance-yellow/40 hover:bg-alliance-gray"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={p.img}
                  alt={t(p.title)}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-alliance-black via-alliance-black/20 to-transparent" />
                <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-alliance-black/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-alliance-light backdrop-blur-sm">
                  {t(p.tag)}
                </span>
              </div>
              <div className="p-7">
                <h3 className="font-display text-2xl tracking-wide text-alliance-light sm:text-3xl">
                  {t(p.title)}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-alliance-light/65">
                  {t(p.desc)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
