import { useEffect, useState } from "react";
import {
  HiX,
  HiOutlineMail,
  HiOutlinePhone,
  HiTrash,
  HiOutlineClock,
  HiOutlineChat,
} from "react-icons/hi";
import { useLang } from "../../i18n/LanguageContext";
import { STAGES, moveLead, addFollowup, deleteFollowup, deleteLead } from "../../lib/leadsStore";

const STAGE_DOT = {
  new: "bg-alliance-yellow",
  contacted: "bg-sky-400",
  scheduled: "bg-violet-400",
  attended: "bg-amber-400",
  won: "bg-emerald-400",
  lost: "bg-rose-500",
};

export default function LeadDrawer({ lead, onClose }) {
  const { t, lang } = useLang();
  const [note, setNote] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const open = Boolean(lead);

  const fmt = (ts, withTime = false) =>
    new Date(ts).toLocaleDateString(lang, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    });

  const submitNote = (e) => {
    e.preventDefault();
    if (!note.trim() || !lead) return;
    addFollowup(lead.id, note);
    setNote("");
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-white/10 bg-alliance-gray shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {!lead ? null : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/8 px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-alliance-yellow">
                  {t("admin.details")}
                </p>
                <h2 className="mt-1 font-display text-3xl leading-none tracking-wide text-alliance-light">
                  {lead.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label={t("modal.close")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-lg text-alliance-light/70 transition-colors hover:bg-white/10 hover:text-alliance-light"
              >
                <HiX />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Stage selector */}
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((stage) => {
                  const active = lead.stage === stage;
                  return (
                    <button
                      key={stage}
                      onClick={() => moveLead(lead.id, stage)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-alliance-yellow bg-alliance-yellow/15 text-alliance-yellow"
                          : "border-white/10 text-alliance-light/55 hover:border-white/25 hover:text-alliance-light"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${STAGE_DOT[stage]}`} />
                      {t(`admin.stage.${stage}`)}
                    </button>
                  );
                })}
              </div>

              {/* Contact info */}
              <div className="mt-6">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-alliance-light/40">
                  {t("admin.contactInfo")}
                </p>
                <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-alliance-black/50 p-4">
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-3 text-sm text-alliance-light/75 transition-colors hover:text-alliance-yellow"
                  >
                    <HiOutlineMail className="shrink-0 text-lg text-alliance-light/40" />
                    <span className="truncate">{lead.email || "—"}</span>
                  </a>
                  <a
                    href={`tel:${(lead.phone || "").replace(/\s/g, "")}`}
                    className="flex items-center gap-3 text-sm text-alliance-light/75 transition-colors hover:text-alliance-yellow"
                  >
                    <HiOutlinePhone className="shrink-0 text-lg text-alliance-light/40" />
                    {lead.phone || "—"}
                  </a>
                  <div className="flex items-center gap-3 text-sm text-alliance-light/55">
                    <HiOutlineClock className="shrink-0 text-lg text-alliance-light/40" />
                    {t("admin.created")} {fmt(lead.createdAt)}
                    <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-alliance-light/45">
                      {lead.source === "manual" ? t("admin.sourceManual") : t("admin.sourceForm")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Follow-ups */}
              <div className="mt-6">
                <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-alliance-light/40">
                  <HiOutlineChat className="text-sm" />
                  {t("admin.followups")}
                  {lead.followups?.length ? (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-alliance-light/60">
                      {lead.followups.length}
                    </span>
                  ) : null}
                </p>

                <form onSubmit={submitNote} className="flex flex-col gap-2">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t("admin.followupPlaceholder")}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-white/10 bg-alliance-black px-4 py-3 text-sm text-alliance-light outline-none transition-colors placeholder:text-alliance-light/30 focus:border-alliance-yellow"
                  />
                  <button
                    type="submit"
                    disabled={!note.trim()}
                    className="self-end rounded-full bg-alliance-yellow px-5 py-2 text-sm font-semibold text-alliance-black transition-colors hover:bg-alliance-yellow-light disabled:opacity-40"
                  >
                    {t("admin.followupAdd")}
                  </button>
                </form>

                <ul className="mt-4 flex flex-col gap-3">
                  {!lead.followups?.length ? (
                    <li className="py-6 text-center text-xs text-alliance-light/30">
                      {t("admin.noFollowups")}
                    </li>
                  ) : (
                    lead.followups.map((n) => (
                      <li
                        key={n.id}
                        className="group relative rounded-xl border border-white/8 bg-alliance-black/50 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wide text-alliance-light/40">
                            {fmt(n.createdAt, true)}
                          </span>
                          <button
                            onClick={() => deleteFollowup(lead.id, n.id)}
                            aria-label="Delete"
                            className="text-alliance-light/30 opacity-0 transition-all hover:text-rose-400 group-hover:opacity-100"
                          >
                            <HiTrash className="text-xs" />
                          </button>
                        </div>
                        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-alliance-light/80">
                          {n.text}
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/8 px-6 py-4">
              <button
                onClick={() => {
                  if (window.confirm(t("admin.deleteConfirm"))) {
                    deleteLead(lead.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-rose-400/80 transition-colors hover:text-rose-400"
              >
                <HiTrash />
                {t("admin.deleteLead")}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
