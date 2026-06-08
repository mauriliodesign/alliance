import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiViewBoards,
  HiUsers,
  HiArrowLeft,
  HiLogout,
  HiX,
  HiChartPie,
  HiCog,
  HiSparkles,
  HiSelector,
  HiCheck,
} from "react-icons/hi";
import { useLang } from "../../i18n/LanguageContext";
import { useAuth } from "../../auth/AuthProvider";
import { useOrg } from "../../org/OrgProvider";

const NAV = [
  { id: "overview", icon: HiChartPie, label: "admin.navOverview" },
  { id: "pipeline", icon: HiViewBoards, label: "admin.navPipeline" },
  { id: "contacts", icon: HiUsers, label: "admin.navContacts" },
  { id: "insights", icon: HiSparkles, label: "admin.navInsights" },
  { id: "settings", icon: HiCog, label: "settings.title" },
];

export default function Sidebar({ view, setView, open, onClose, dueCount = 0 }) {
  const { t } = useLang();
  const { user, signOut } = useAuth();
  const { orgs, org, setActiveOrg } = useOrg();
  const navigate = useNavigate();
  const [switcher, setSwitcher] = useState(false);

  const logout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/8 bg-alliance-gray/60 backdrop-blur-md transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/" className="flex items-center">
            <img src="/brand/logo-alliance-team.png" alt="Alliance Jiu Jitsu Lisboa" className="h-10 w-auto" />
          </Link>
          <button
            onClick={onClose}
            aria-label={t("modal.close")}
            className="text-xl text-alliance-light/60 transition-colors hover:text-alliance-light lg:hidden"
          >
            <HiX />
          </button>
        </div>

        {/* Organization switcher */}
        <div className="relative px-3">
          <button
            onClick={() => orgs.length > 1 && setSwitcher((v) => !v)}
            className={`flex w-full items-center gap-2 rounded-xl border border-white/8 bg-alliance-black/40 px-3 py-2.5 text-left ${
              orgs.length > 1 ? "hover:border-white/20" : "cursor-default"
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-alliance-yellow/15 text-xs font-bold text-alliance-yellow">
              {(org?.name || "A").slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-alliance-light">
                {org?.name || "—"}
              </span>
              <span className="block text-[10px] uppercase tracking-wide text-alliance-light/40">
                {org?.role || ""}
              </span>
            </span>
            {orgs.length > 1 && <HiSelector className="shrink-0 text-alliance-light/40" />}
          </button>

          {switcher && orgs.length > 1 && (
            <ul className="absolute inset-x-3 z-10 mt-1 overflow-hidden rounded-xl border border-white/10 bg-alliance-gray shadow-2xl">
              {orgs.map((o) => (
                <li key={o.id}>
                  <button
                    onClick={() => {
                      setActiveOrg(o.id);
                      setSwitcher(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-alliance-light/80 transition-colors hover:bg-white/5"
                  >
                    <span className="truncate">{o.name}</span>
                    {o.id === org?.id && <HiCheck className="ml-auto text-alliance-yellow" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-alliance-light/35">
            {t("admin.menu")}
          </p>
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  onClose();
                }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-alliance-yellow/15 text-alliance-yellow"
                    : "text-alliance-light/65 hover:bg-white/5 hover:text-alliance-light"
                }`}
              >
                <Icon className="text-lg" />
                {t(item.label)}
                {item.id === "pipeline" && dueCount > 0 ? (
                  <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-bold leading-none text-alliance-light/70">
                    {dueCount}
                  </span>
                ) : (
                  active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-alliance-yellow" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex flex-col gap-1 border-t border-white/8 px-3 py-4">
          {user?.email && (
            <p className="truncate px-3 pb-1 text-[11px] text-alliance-light/40">{user.email}</p>
          )}
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-alliance-light/65 transition-colors hover:bg-white/5 hover:text-alliance-light"
          >
            <HiArrowLeft className="text-lg" />
            {t("login.backToSite")}
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-alliance-light/65 transition-colors hover:bg-white/5 hover:text-rose-400"
          >
            <HiLogout className="text-lg" />
            {t("admin.logout")}
          </button>
        </div>
      </aside>
    </>
  );
}
