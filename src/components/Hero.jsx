import { HiArrowRight } from "react-icons/hi";
import { useLang } from "../i18n/LanguageContext";
import { useBooking } from "./BookingContext";

export default function Hero() {
  const { t } = useLang();
  const { openBooking } = useBooking();

  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/all.webp"
          alt="Alliance Jiu Jitsu Lisboa"
          className="h-full w-full object-cover object-center"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-alliance-black via-alliance-black/85 to-alliance-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-alliance-black via-transparent to-alliance-black/60" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-28 sm:px-8">
        <div className="max-w-2xl">
          <span
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-alliance-yellow/40 bg-alliance-yellow/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-alliance-yellow"
            style={{ animation: "fadeInUp 0.6s ease both" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-alliance-yellow" />
            Moscavide · Lisboa
          </span>

          <h1
            className="font-display text-6xl leading-[0.92] text-alliance-light sm:text-7xl md:text-8xl"
            style={{ animation: "fadeInUp 0.7s ease 0.05s both" }}
          >
            {t("hero.headline1")}
            <br />
            <span className="text-alliance-yellow">{t("hero.headline2")}</span>
          </h1>

          <p
            className="mt-5 font-display text-2xl tracking-wide text-alliance-light/90 sm:text-3xl"
            style={{ animation: "fadeInUp 0.7s ease 0.12s both" }}
          >
            {t("hero.headline3")}
          </p>

          <p
            className="mt-6 max-w-xl text-base leading-relaxed text-alliance-light/70 sm:text-lg"
            style={{ animation: "fadeInUp 0.7s ease 0.18s both" }}
          >
            {t("hero.sub")}
          </p>

          <div
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animation: "fadeInUp 0.7s ease 0.24s both" }}
          >
            <button
              onClick={openBooking}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-alliance-yellow px-7 py-4 text-base font-semibold text-alliance-black transition-all hover:scale-105 hover:bg-alliance-yellow-light"
            >
              {t("hero.cta1")}
              <HiArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={openBooking}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-base font-semibold text-alliance-light transition-colors hover:border-alliance-yellow hover:text-alliance-yellow"
            >
              {t("hero.cta2")}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex-col items-center gap-2 hidden sm:flex">
        <span className="text-xs uppercase tracking-widest text-alliance-light/50">
          {t("hero.scroll")}
        </span>
        <span className="block h-10 w-px bg-gradient-to-b from-alliance-yellow to-transparent animate-scroll-pulse" />
      </div>
    </section>
  );
}
