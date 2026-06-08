import { useState } from "react";
import { HiSparkles, HiRefresh, HiArrowRight } from "react-icons/hi";
import { useLang } from "../../i18n/LanguageContext";
import { useToast } from "../ToastContext";
import { useSettings } from "../../hooks/useSettings";
import Avatar from "./Avatar";
import { buildPipelineContext, generateInsight } from "../../lib/insights";

const PRIORITY = {
  high: { label: "insights.priorityHigh", dot: "bg-rose-500" },
  medium: { label: "insights.priorityMedium", dot: "bg-amber-400" },
  low: { label: "insights.priorityLow", dot: "bg-alliance-light/30" },
};

export default function Insights({ leads, onOpen }) {
  const { t, lang } = useLang();
  const { showToast } = useToast();
  const settings = useSettings();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const aiEnabled = settings.integrations.aiEnabled;
  const active = leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
  const byId = (id) => leads.find((l) => l.id === id);

  const run = async () => {
    setLoading(true);
    try {
      const data = buildPipelineContext(leads, settings, lang);
      const res = await generateInsight({
        kind: "pipeline",
        data,
        lang,
        model: settings.integrations.geminiModel,
      });
      setResult(res);
    } catch (err) {
      showToast({ message: t(err.message) });
    } finally {
      setLoading(false);
    }
  };

  if (!aiEnabled) {
    return (
      <div className="rounded-2xl border border-white/8 bg-alliance-gray/40 py-16 text-center text-sm text-alliance-light/45">
        {t("insights.disabled")}
      </div>
    );
  }

  if (active.length === 0) {
    return (
      <div className="rounded-2xl border border-white/8 bg-alliance-gray/40 py-16 text-center text-sm text-alliance-light/40">
        {t("insights.empty")}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-end">
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-alliance-yellow px-5 py-2.5 text-sm font-semibold text-alliance-black transition-colors hover:bg-alliance-yellow-light disabled:opacity-50"
        >
          {result ? <HiRefresh className={loading ? "animate-spin" : ""} /> : <HiSparkles />}
          {loading ? t("insights.loading") : result ? t("insights.regenerate") : t("insights.generatePipeline")}
        </button>
      </div>

      {!result ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-alliance-gray/30 py-16 text-center">
          <HiSparkles className="mx-auto text-3xl text-alliance-yellow/60" />
          <p className="mx-auto mt-3 max-w-sm text-sm text-alliance-light/50">{t("insights.subtitle")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <section className="rounded-2xl border border-alliance-yellow/20 bg-alliance-yellow/[0.04] p-5">
            <p className="text-sm leading-relaxed text-alliance-light/85">{result.summary}</p>
          </section>

          <ul className="flex flex-col gap-2.5">
            {result.ranked.map((item, i) => {
              const lead = byId(item.id);
              if (!lead) return null;
              const pr = PRIORITY[(item.priority || "").toLowerCase()] || PRIORITY.low;
              return (
                <li key={item.id || i}>
                  <button
                    onClick={() => onOpen(lead.id)}
                    className="group flex w-full items-start gap-3 rounded-xl border border-white/8 bg-alliance-gray/40 p-4 text-left transition-colors hover:border-alliance-yellow/40"
                  >
                    <Avatar name={lead.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-alliance-light">{lead.name}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-alliance-light/70">
                          <span className={`h-1.5 w-1.5 rounded-full ${pr.dot}`} />
                          {t(pr.label)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-alliance-light/55">{item.reason}</p>
                      <p className="mt-1.5 text-sm text-alliance-light/85">{item.action}</p>
                    </div>
                    <HiArrowRight className="mt-1 shrink-0 text-alliance-light/20 transition-colors group-hover:text-alliance-yellow" />
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="text-[10px] leading-relaxed text-alliance-light/30">{t("insights.freeTier")}</p>
        </div>
      )}
    </div>
  );
}
