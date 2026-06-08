import { useState } from "react";
import { Link } from "react-router-dom";
import { HiArrowLeft, HiOutlineMail, HiOutlineLockClosed, HiEye, HiEyeOff } from "react-icons/hi";
import { useLang } from "../i18n/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Login() {
  const { t } = useLang();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading

  const change = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("loading");
    // No backend in this clone — simulate auth then reset.
    setTimeout(() => setStatus("idle"), 1200);
  };

  return (
    <div className="flex min-h-screen bg-alliance-black">
      {/* Left visual panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img
          src="/images/all.webp"
          alt="Alliance Jiu Jitsu Lisboa"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-alliance-black via-alliance-black/55 to-alliance-black/30" />
        <div className="absolute inset-0 flex flex-col p-12">
          <Link to="/" className="flex w-fit items-center">
            <img
              src="/brand/logo-alliance-team.png"
              alt="Alliance Jiu Jitsu Lisboa"
              className="h-14 w-auto"
            />
          </Link>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex w-full flex-col px-6 py-8 sm:px-12 lg:w-1/2">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-alliance-light/60 transition-colors hover:text-alliance-yellow"
          >
            <HiArrowLeft />
            {t("login.backToSite")}
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <Link to="/" className="mb-8 flex justify-center lg:hidden">
              <img
                src="/brand/logo-alliance-team.png"
                alt="Alliance Jiu Jitsu Lisboa"
                className="h-14 w-auto"
              />
            </Link>

            <h1 className="font-display text-4xl tracking-wide text-alliance-light sm:text-5xl">
              {t("login.title")}
            </h1>
            <p className="mt-2 text-sm text-alliance-light/60">{t("login.subtitle")}</p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              {/* Email */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-alliance-light/60">
                  {t("login.emailLabel")}
                </span>
                <div className="relative">
                  <HiOutlineMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-alliance-light/40" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={change("email")}
                    placeholder={t("login.emailPlaceholder")}
                    className="w-full rounded-xl border border-white/10 bg-alliance-gray px-4 py-3 pl-11 text-sm text-alliance-light outline-none transition-colors placeholder:text-alliance-light/30 focus:border-alliance-yellow"
                  />
                </div>
              </label>

              {/* Password */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-alliance-light/60">
                  {t("login.passwordLabel")}
                </span>
                <div className="relative">
                  <HiOutlineLockClosed className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-alliance-light/40" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={change("password")}
                    placeholder={t("login.passwordPlaceholder")}
                    className="w-full rounded-xl border border-white/10 bg-alliance-gray px-4 py-3 pl-11 pr-11 text-sm text-alliance-light outline-none transition-colors placeholder:text-alliance-light/30 focus:border-alliance-yellow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label="Toggle password"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-alliance-light/40 transition-colors hover:text-alliance-yellow"
                  >
                    {showPw ? <HiEyeOff /> : <HiEye />}
                  </button>
                </div>
              </label>

              {/* Remember + forgot */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-alliance-light/70">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={change("remember")}
                    className="h-4 w-4 cursor-pointer accent-alliance-yellow"
                  />
                  {t("login.remember")}
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-alliance-yellow transition-opacity hover:opacity-80"
                >
                  {t("login.forgot")}
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-1 w-full rounded-full bg-alliance-yellow px-6 py-3.5 text-sm font-semibold text-alliance-black transition-all hover:scale-[1.02] hover:bg-alliance-yellow-light disabled:opacity-60"
              >
                {status === "loading" ? t("login.loading") : t("login.submit")}
              </button>
            </form>

            {/* No account */}
            <p className="mt-8 text-center text-sm text-alliance-light/60">
              {t("login.noAccount")}{" "}
              <Link
                to="/#aula-experimental"
                className="font-semibold text-alliance-yellow transition-opacity hover:opacity-80"
              >
                {t("login.signup")}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-alliance-light/30">
          © {new Date().getFullYear()} {t("footer.copyright")}
        </p>
      </div>
    </div>
  );
}
