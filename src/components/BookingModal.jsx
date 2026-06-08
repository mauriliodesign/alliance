import { useEffect, useState } from "react";
import { HiX, HiCheckCircle } from "react-icons/hi";
import { useLang } from "../i18n/LanguageContext";
import { useBooking } from "./BookingContext";
import { usePublicBusiness } from "../hooks/usePublicBusiness";
import { supabase, ORG_SLUG } from "../lib/supabaseClient";

export default function BookingModal() {
  const { t } = useLang();
  const { open, closeBooking } = useBooking();
  const business = usePublicBusiness();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  useEffect(() => {
    if (!open) {
      // reset shortly after close so the closing animation looks clean
      const id = setTimeout(() => {
        setStatus("idle");
        setForm({ name: "", email: "", phone: "" });
      }, 300);
      return () => clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeBooking();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeBooking]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    // Persist the lead in this academy's pipeline via the public RPC (anon).
    try {
      await supabase.rpc("submit_lead", {
        p_slug: ORG_SLUG,
        p_name: form.name,
        p_email: form.email || null,
        p_phone: form.phone || null,
        p_instagram: null,
        p_tags: [],
      });
    } catch {
      /* still show success + WhatsApp handoff even if the insert fails */
    }
    const msg = encodeURIComponent(
      `${t("modal.title")}\n${t("modal.nameLabel")}: ${form.name}\n${t("modal.emailLabel")}: ${form.email}\n${t("modal.phoneLabel")}: ${form.phone}`
    );
    window.open(`https://wa.me/${business.whatsapp}?text=${msg}`, "_blank", "noopener");
    setStatus("success");
  };

  const change = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        style={{ animation: "fadeInUp 0.2s ease both" }}
        onClick={closeBooking}
      />
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-alliance-gray shadow-2xl"
        style={{ animation: "fadeInUp 0.3s ease both" }}
      >
        <button
          onClick={closeBooking}
          aria-label={t("modal.close")}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-lg text-alliance-light/70 transition-colors hover:bg-white/10 hover:text-alliance-light"
        >
          <HiX />
        </button>

        {status === "success" ? (
          <div className="flex flex-col items-center px-8 py-14 text-center">
            <HiCheckCircle className="text-6xl text-alliance-yellow" />
            <h3 className="mt-5 font-display text-3xl tracking-wide text-alliance-light">
              {t("modal.successTitle")}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-alliance-light/65">
              {t("modal.successSub")}
            </p>
            <button
              onClick={closeBooking}
              className="mt-7 rounded-full bg-alliance-yellow px-7 py-3 text-sm font-semibold text-alliance-black transition-colors hover:bg-alliance-yellow-light"
            >
              {t("modal.close")}
            </button>
          </div>
        ) : (
          <div className="px-8 py-9">
            <h3 className="font-display text-3xl tracking-wide text-alliance-light">
              {t("modal.title")}
            </h3>
            <p className="mt-2 text-sm text-alliance-light/60">{t("modal.sub")}</p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <Field
                label={t("modal.nameLabel")}
                placeholder={t("modal.namePlaceholder")}
                value={form.name}
                onChange={change("name")}
                required
              />
              <Field
                label={t("modal.emailLabel")}
                type="email"
                placeholder={t("modal.emailPlaceholder")}
                value={form.email}
                onChange={change("email")}
                required
              />
              <Field
                label={t("modal.phoneLabel")}
                type="tel"
                placeholder={t("modal.phonePlaceholder")}
                value={form.phone}
                onChange={change("phone")}
                required
              />

              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-2 w-full rounded-full bg-alliance-yellow px-6 py-3.5 text-sm font-semibold text-alliance-black transition-all hover:bg-alliance-yellow-light disabled:opacity-60"
              >
                {status === "loading" ? t("modal.loading") : t("modal.submit")}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-alliance-light/60">
        {label}
      </span>
      <input
        {...props}
        className="rounded-xl border border-white/10 bg-alliance-black px-4 py-3 text-sm text-alliance-light outline-none transition-colors placeholder:text-alliance-light/30 focus:border-alliance-yellow"
      />
    </label>
  );
}
