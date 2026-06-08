import { HiCheck } from "react-icons/hi";
import { useLang } from "../i18n/LanguageContext";
import { useBooking } from "./BookingContext";
import { useReveal } from "../hooks/useReveal";
import SectionLabel from "./SectionLabel";

const PLANS = [
  {
    name: "pricing.kidsName",
    prefix: "pricing.kidsPrefix",
    features: ["pricing.kidsF1", "pricing.kidsF2", "pricing.kidsF3", "pricing.kidsF4"],
  },
  {
    name: "pricing.adultsName",
    prefix: "pricing.adultsPrefix",
    popular: true,
    features: [
      "pricing.adultsF1",
      "pricing.adultsF2",
      "pricing.adultsF3",
      "pricing.adultsF4",
      "pricing.adultsF5",
    ],
  },
  {
    name: "pricing.dropinName",
    prefix: "pricing.dropinPrefix",
    features: ["pricing.dropinF1", "pricing.dropinF2", "pricing.dropinF3"],
  },
  {
    name: "pricing.private1Name",
    prefix: "pricing.private1Prefix",
    features: [
      "pricing.private1F1",
      "pricing.private1F2",
      "pricing.private1F3",
      "pricing.private1F4",
    ],
  },
  {
    name: "pricing.private2Name",
    prefix: "pricing.private2Prefix",
    features: [
      "pricing.private2F1",
      "pricing.private2F2",
      "pricing.private2F3",
      "pricing.private2F4",
    ],
  },
];

export default function Pricing() {
  const { t } = useLang();
  const { openBooking } = useBooking();
  const ref = useReveal();

  return (
    <section id="precos" ref={ref} className="bg-alliance-gray/40 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="reveal mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <SectionLabel>{t("pricing.label")}</SectionLabel>
          </div>
          <h2 className="mt-4 font-display text-4xl leading-tight text-alliance-light sm:text-5xl md:text-6xl">
            {t("pricing.title")}{" "}
            <span className="text-alliance-yellow">{t("pricing.titleHighlight")}</span>
          </h2>
          <p className="mt-4 text-lg text-alliance-light/65">{t("pricing.sub")}</p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <article
              key={plan.name}
              className={`reveal relative flex flex-col rounded-2xl border p-8 transition-all duration-300 ${
                plan.popular
                  ? "border-alliance-yellow/60 bg-alliance-black ring-1 ring-alliance-yellow/30"
                  : "border-white/8 bg-alliance-black/60 hover:border-alliance-yellow/30"
              }`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-alliance-yellow px-4 py-1 text-xs font-bold uppercase tracking-wider text-alliance-black">
                  {t("pricing.mostPopular")}
                </span>
              )}

              <h3 className="font-display text-2xl tracking-wide text-alliance-light">
                {t(plan.name)}
              </h3>
              <p className="mt-2 text-sm font-medium uppercase tracking-wide text-alliance-yellow/80">
                {t(plan.prefix)}
              </p>

              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-alliance-light/75">
                    <HiCheck className="mt-0.5 shrink-0 text-base text-alliance-yellow" />
                    {t(f)}
                  </li>
                ))}
              </ul>

              <button
                onClick={openBooking}
                className={`mt-8 w-full rounded-full px-6 py-3.5 text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-alliance-yellow text-alliance-black hover:bg-alliance-yellow-light"
                    : "border border-white/20 text-alliance-light hover:border-alliance-yellow hover:text-alliance-yellow"
                }`}
              >
                {t("pricing.cta")}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
