import { HiArrowRight, HiLocationMarker } from "react-icons/hi";
import { useLang } from "../i18n/LanguageContext";
import { useBooking } from "./BookingContext";
import { useReveal } from "../hooks/useReveal";

export default function Reopen() {
  const { t } = useLang();
  const { openBooking } = useBooking();
  const ref = useReveal();

  return (
    <section ref={ref} className="bg-alliance-black py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="reveal relative overflow-hidden rounded-3xl border border-alliance-yellow/20 bg-gradient-to-br from-alliance-gray to-alliance-black p-8 sm:p-14">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-alliance-yellow/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-alliance-yellow/40 bg-alliance-yellow/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-alliance-yellow">
              {t("reopen.badge")}
            </span>

            <h2 className="mt-5 font-display text-4xl leading-tight text-alliance-light sm:text-5xl md:text-6xl">
              {t("reopen.title1")}{" "}
              <span className="text-alliance-yellow">{t("reopen.title2")}</span>
            </h2>

            <p className="mt-5 text-base leading-relaxed text-alliance-light/70 sm:text-lg">
              {t("reopen.sub")}
            </p>

            <div className="mt-6 flex items-center gap-2 text-sm text-alliance-light/60">
              <HiLocationMarker className="text-lg text-alliance-yellow" />
              {t("reopen.address")}
            </div>

            <p className="mt-4 text-sm font-semibold text-alliance-yellow">
              {t("reopen.offer")}
            </p>

            <button
              onClick={openBooking}
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-alliance-yellow px-8 py-4 text-base font-semibold text-alliance-black transition-all hover:scale-105 hover:bg-alliance-yellow-light"
            >
              {t("reopen.cta")}
              <HiArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
