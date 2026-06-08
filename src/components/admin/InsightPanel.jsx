import { useState } from "react";
import { HiSparkles, HiOutlineClipboard, HiCheck, HiRefresh } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { useLang } from "../../i18n/LanguageContext";
import { useToast } from "../ToastContext";
import { useSettings } from "../../hooks/useSettings";
import { timeAgo } from "../../lib/format";
import { buildLeadContext, generateInsight } from "../../lib/insights";
import { updateLead } from "../../lib/leadsStore";

export default function InsightPanel({ lead }) {
  const { t, lang } = useLang();
  const { showToast } = useToast();
  const settings = useSettings();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const aiEnabled = settings.integrations.aiEnabled;
  const insight = lead.insight;

  const run = async () => {
    setLoading(true);
    try {
      const data = buildLeadContext(lead, settings, lang);
      const result = await generateInsight({
        kind: "lead",
        data,
        lang,
        model: settings.integrations.geminiModel,
      });
      updateLead(lead.id, { insight: { ...result, generatedAt: Date.now(), lang } });
    } catch (err) {
      showToast({ message: t(err.message) });
    } finally {
      setLoading(false);
    }
  };

  const copyMsg = async () => {
    try {
      await navigator.clipboard.writeText(insight.suggestedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const waHref = `https://wa.me/${(lead.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(
    insight?.suggestedMessage || ""
  )}`;

  return (
    <div className="mt-6">
      <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-alliance-yellow">
        <HiSparkles className="text-sm" /> {t("insights.title")}
      </p>

      {!aiEnabled ? (
        <p className="rounded-2xl border border-white/8 bg-alliance-black/50 p-4 text-xs text-alliance-light/45">
          {t("insights.disabled")}
        </p>
      ) : !insight ? (
        <button
          onClick={run}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-alliance-yellow/40 py-3 text-sm font-semibold text-alliance-yellow transition-colors hover:bg-alliance-yellow/10 disabled:opacity-50"
        >
          <HiSparkles /> {loading ? t("insights.loading") : t("insights.generate")}
        </button>
      ) : (
        <div className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-alliance-black/50 p-4">
          {/* Close probability */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-alliance-light/55">{t("insights.closeProb")}</span>
              <span className="font-display text-2xl leading-none text-alliance-light">{insight.closeProbability}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-alliance-yellow" style={{ width: `${insight.closeProbability}%` }} />
            </div>
          </div>

          {insight.signals?.length > 0 && (
            <Block title={t("insights.signals")}>
              <ul className="flex flex-col gap-1">
                {insight.signals.map((sgn, i) => (
                  <li key={i} className="flex gap-2 text-sm text-alliance-light/75">
                    <span className="text-alliance-yellow">•</span> {sgn}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          <Block title={t("insights.nextAction")}>
            <p className="text-sm text-alliance-light/85">{insight.nextAction}</p>
          </Block>

          <Block title={t("insights.suggestedMsg")}>
            <p className="whitespace-pre-wrap rounded-lg bg-white/5 p-3 text-sm leading-relaxed text-alliance-light/85">
              {insight.suggestedMessage}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={copyMsg}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-alliance-light/70 transition-colors hover:border-alliance-yellow hover:text-alliance-yellow"
              >
                {copied ? <HiCheck /> : <HiOutlineClipboard />} {copied ? t("insights.copied") : t("insights.copy")}
              </button>
              {(lead.phone || "").replace(/\D/g, "") && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-alliance-light/70 transition-colors hover:border-whatsapp hover:text-whatsapp"
                >
                  <FaWhatsapp /> {t("insights.sendWhatsapp")}
                </a>
              )}
            </div>
          </Block>

          {insight.risks?.length > 0 && (
            <Block title={t("insights.risks")}>
              <ul className="flex flex-col gap-1">
                {insight.risks.map((rk, i) => (
                  <li key={i} className="flex gap-2 text-sm text-alliance-light/75">
                    <span className="text-rose-400">•</span> {rk}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <span className="text-[10px] text-alliance-light/35">
              {t("insights.generatedAgo")} {timeAgo(insight.generatedAt, lang)}
            </span>
            <button
              onClick={run}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-alliance-light/60 transition-colors hover:text-alliance-yellow disabled:opacity-50"
            >
              <HiRefresh className={loading ? "animate-spin" : ""} /> {loading ? t("insights.loading") : t("insights.regenerate")}
            </button>
          </div>

          <p className="text-[10px] leading-relaxed text-alliance-light/30">{t("insights.freeTier")}</p>
        </div>
      )}
    </div>
  );
}

function Block({ title, children }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-alliance-light/40">{title}</p>
      {children}
    </div>
  );
}
