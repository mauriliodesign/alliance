import { useRef, useState } from "react";
import {
  HiOfficeBuilding,
  HiViewBoards,
  HiLink,
  HiDatabase,
  HiX,
  HiDownload,
  HiUpload,
  HiTrash,
  HiCheck,
} from "react-icons/hi";
import { useLang } from "../../i18n/LanguageContext";
import { useToast } from "../ToastContext";
import { useSettings } from "../../hooks/useSettings";
import { updateSettings } from "../../lib/settingsStore";
import { STAGES, getLeads, importLeads, resetLeads } from "../../lib/leadsStore";

const TABS = [
  { id: "business", icon: HiOfficeBuilding, label: "settings.tabBusiness" },
  { id: "pipeline", icon: HiViewBoards, label: "settings.tabPipeline" },
  { id: "integrations", icon: HiLink, label: "settings.tabIntegrations" },
  { id: "data", icon: HiDatabase, label: "settings.tabData" },
];

export default function Settings() {
  const { t } = useLang();
  const [tab, setTab] = useState("business");
  const s = useSettings();

  return (
    <div className="max-w-3xl">
      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tb) => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active ? "border-alliance-yellow bg-alliance-yellow/15 text-alliance-yellow" : "border-white/10 text-alliance-light/60 hover:border-white/25 hover:text-alliance-light"
              }`}
            >
              <Icon className="text-base" />
              {t(tb.label)}
            </button>
          );
        })}
      </div>

      {tab === "business" && <BusinessTab t={t} s={s} />}
      {tab === "pipeline" && <PipelineTab t={t} s={s} />}
      {tab === "integrations" && <IntegrationsTab t={t} s={s} />}
      {tab === "data" && <DataTab t={t} s={s} />}
    </div>
  );
}

/* ---------- Business ---------- */
function BusinessTab({ t, s }) {
  const set = (k) => (e) => updateSettings({ business: { [k]: e.target.value } });
  const b = s.business;
  return (
    <Card title={t("settings.tabBusiness")} hint={t("settings.bizHint")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("settings.bizName")} value={b.name} onChange={set("name")} className="sm:col-span-2" />
        <Field label={t("settings.bizAddress")} value={b.address} onChange={set("address")} className="sm:col-span-2" />
        <Field label={t("settings.bizPhone")} value={b.phone} onChange={set("phone")} />
        <Field label={t("settings.bizWhatsapp")} value={b.whatsapp} onChange={set("whatsapp")} />
        <Field label={t("settings.bizEmail")} value={b.email} onChange={set("email")} />
        <Field label={t("settings.bizInstagram")} value={b.instagram} onChange={set("instagram")} />
      </div>
    </Card>
  );
}

/* ---------- Pipeline ---------- */
function PipelineTab({ t, s }) {
  const [tag, setTag] = useState("");
  const tags = s.pipeline.tags;

  const addTag = (e) => {
    e.preventDefault();
    const v = tag.trim().toLowerCase();
    if (v && !tags.includes(v)) updateSettings({ pipeline: { tags: [...tags, v] } });
    setTag("");
  };
  const removeTag = (v) => updateSettings({ pipeline: { tags: tags.filter((x) => x !== v) } });

  return (
    <div className="flex flex-col gap-6">
      <Card title={t("settings.tagsTitle")} hint={t("settings.tagsHint")}>
        <div className="flex flex-wrap gap-2">
          {tags.map((tg) => (
            <span key={tg} className="inline-flex items-center gap-1.5 rounded-full bg-alliance-yellow/10 px-3 py-1 text-xs font-medium text-alliance-yellow">
              {tg}
              <button onClick={() => removeTag(tg)} aria-label="remove" className="opacity-60 hover:opacity-100"><HiX className="text-xs" /></button>
            </span>
          ))}
        </div>
        <form onSubmit={addTag} className="mt-3">
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder={t("settings.tagAdd")} className="w-full max-w-xs rounded-lg border border-white/10 bg-alliance-black px-3 py-2 text-sm text-alliance-light outline-none placeholder:text-alliance-light/30 focus:border-alliance-yellow" />
        </form>
      </Card>

      <Card title={t("settings.followupDays")} hint={t("settings.followupHint")}>
        <input
          type="number"
          min="0"
          value={s.pipeline.followupDays}
          onChange={(e) => updateSettings({ pipeline: { followupDays: Number(e.target.value) || 0 } })}
          className="w-28 rounded-lg border border-white/10 bg-alliance-black px-3 py-2 text-sm text-alliance-light outline-none focus:border-alliance-yellow"
        />
      </Card>

      <Card title={t("settings.stageLabels")} hint={t("settings.stageHint")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {STAGES.map((st) => (
            <label key={st} className="flex flex-col gap-1.5">
              <span className="text-xs text-alliance-light/45">{t(`admin.stage.${st}`)}</span>
              <input
                value={s.pipeline.stageLabels[st] || ""}
                placeholder={t(`admin.stage.${st}`)}
                onChange={(e) => updateSettings({ pipeline: { stageLabels: { ...s.pipeline.stageLabels, [st]: e.target.value } } })}
                className="rounded-lg border border-white/10 bg-alliance-black px-3 py-2 text-sm text-alliance-light outline-none placeholder:text-alliance-light/30 focus:border-alliance-yellow"
              />
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------- Integrations ---------- */
function IntegrationsTab({ t, s }) {
  return (
    <div className="flex flex-col gap-6">
      <Card title={t("settings.gtmId")} hint={t("settings.gtmHint")}>
        <input
          value={s.integrations.gtmId}
          onChange={(e) => updateSettings({ integrations: { gtmId: e.target.value } })}
          className="w-full max-w-xs rounded-lg border border-white/10 bg-alliance-black px-3 py-2 text-sm text-alliance-light outline-none focus:border-alliance-yellow"
        />
      </Card>

      <Card title={t("settings.gcal")} hint={t("settings.gcalHint")}>
        <button disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-alliance-light/40">
          {t("settings.connect")}
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide">{t("settings.comingSoon")}</span>
        </button>
      </Card>
    </div>
  );
}

/* ---------- Data & account ---------- */
function DataTab({ t, s }) {
  const { showToast } = useToast();
  const fileRef = useRef(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(getLeads(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alliance-leads-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importLeads(JSON.parse(reader.result));
        showToast({ message: t("settings.imported") });
      } catch {
        showToast({ message: t("settings.importError") });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-6">
      <Card title={t("settings.dataTitle")}>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportJson} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-alliance-light/80 transition-colors hover:border-alliance-yellow hover:text-alliance-yellow">
            <HiDownload className="text-lg" /> {t("settings.export")}
          </button>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-alliance-light/80 transition-colors hover:border-alliance-yellow hover:text-alliance-yellow">
            <HiUpload className="text-lg" /> {t("settings.import")}
          </button>
          <input ref={fileRef} type="file" accept="application/json" onChange={onImport} className="hidden" />
          <button
            onClick={() => {
              if (window.confirm(t("settings.resetConfirm"))) {
                resetLeads();
                showToast({ message: t("settings.saved") });
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 px-4 py-2.5 text-sm font-medium text-rose-400/80 transition-colors hover:border-rose-500 hover:text-rose-400"
          >
            <HiTrash className="text-lg" /> {t("settings.reset")}
          </button>
        </div>
      </Card>

      <Card title={t("settings.tabData")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("settings.adminEmail")} value={s.account.adminEmail} onChange={(e) => updateSettings({ account: { adminEmail: e.target.value } })} />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-alliance-light/60">{t("settings.password")}</span>
            <input disabled placeholder="••••••••" className="cursor-not-allowed rounded-xl border border-white/10 bg-alliance-black/50 px-4 py-3 text-sm text-alliance-light/40 outline-none" />
            <span className="text-xs text-alliance-light/40">{t("settings.passwordSoon")}</span>
          </label>
        </div>
      </Card>
    </div>
  );
}

/* ---------- shared ---------- */
function Card({ title, hint, children }) {
  return (
    <section className="rounded-2xl border border-white/8 bg-alliance-gray/40 p-6">
      <h3 className="font-display text-xl tracking-wide text-alliance-light">{title}</h3>
      {hint && <p className="mt-1 text-xs text-alliance-light/45">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, className = "", ...props }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-alliance-light/60">{label}</span>
      <input
        {...props}
        className="rounded-xl border border-white/10 bg-alliance-black px-4 py-3 text-sm text-alliance-light outline-none transition-colors placeholder:text-alliance-light/30 focus:border-alliance-yellow"
      />
    </label>
  );
}
