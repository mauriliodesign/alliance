import { useState } from "react";
import { HiPlus } from "react-icons/hi";
import { useLang } from "../i18n/LanguageContext";
import { useReveal } from "../hooks/useReveal";
import SectionLabel from "./SectionLabel";

const ITEMS = [1, 2, 3, 4, 5, 6, 7];

export default function FAQ() {
  const { t } = useLang();
  const ref = useReveal();
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" ref={ref} className="bg-alliance-gray/40 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="reveal text-center">
          <div className="flex justify-center">
            <SectionLabel>{t("faq.label")}</SectionLabel>
          </div>
          <h2 className="mt-4 font-display text-4xl leading-tight text-alliance-light sm:text-5xl md:text-6xl">
            {t("faq.title")}{" "}
            <span className="text-alliance-yellow">{t("faq.titleHighlight")}</span>
          </h2>
        </div>

        <div className="reveal mt-12 flex flex-col gap-3">
          {ITEMS.map((n, i) => {
            const isOpen = open === i;
            return (
              <div
                key={n}
                className={`overflow-hidden rounded-2xl border transition-colors ${
                  isOpen ? "border-alliance-yellow/40 bg-alliance-black" : "border-white/8 bg-alliance-black/50"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-base font-semibold text-alliance-light sm:text-lg">
                    {t(`faq.q${n}`)}
                  </span>
                  <HiPlus
                    className={`shrink-0 text-xl text-alliance-yellow transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-alliance-light/65 sm:text-base">
                      {t(`faq.a${n}`)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
