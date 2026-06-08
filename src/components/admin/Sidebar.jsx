import { Link } from "react-router-dom";
import { HiViewBoards, HiUsers, HiArrowLeft, HiLogout, HiX, HiChartPie } from "react-icons/hi";
import { useLang } from "../../i18n/LanguageContext";

const NAV = [
  { id: "overview", icon: HiChartPie, label: "admin.navOverview" },
  { id: "pipeline", icon: HiViewBoards, label: "admin.navPipeline" },
  { id: "contacts", icon: HiUsers, label: "admin.navContacts" },
];

export default function Sidebar({ view, setView, open, onClose, dueCount = 0 }) {
  const { t } = useLang();

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
            <img
              src="/brand/logo-alliance-team.png"
              alt="Alliance Jiu Jitsu Lisboa"
              className="h-10 w-auto"
            />
          </Link>
          <button
            onClick={onClose}
            aria-label={t("modal.close")}
            className="text-xl text-alliance-light/60 transition-colors hover:text-alliance-light lg:hidden"
          >
            <HiX />
          </button>
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
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-alliance-light/65 transition-colors hover:bg-white/5 hover:text-alliance-light"
          >
            <HiArrowLeft className="text-lg" />
            {t("login.backToSite")}
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-alliance-light/65 transition-colors hover:bg-white/5 hover:text-rose-400"
          >
            <HiLogout className="text-lg" />
            {t("admin.logout")}
          </Link>
        </div>
      </aside>
    </>
  );
}
