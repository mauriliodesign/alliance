import { useEffect, useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { useLang } from "../i18n/LanguageContext";
import { useBooking } from "./BookingContext";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV_LINKS = [
  { key: "navbar.programs", href: "#programas" },
  { key: "navbar.trialClass", href: "#aula-experimental" },
  { key: "navbar.team", href: "#equipa" },
  { key: "navbar.schedule", href: "#horarios" },
  { key: "navbar.pricing", href: "#precos" },
  { key: "navbar.faq", href: "#faq" },
];

export default function Navbar() {
  const { t } = useLang();
  const { openBooking } = useBooking();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-alliance-black/90 backdrop-blur-md border-b border-white/5 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2" onClick={close}>
          <img
            src="/brand/logo-alliance-sem-fundo.png"
            alt="Alliance Jiu Jitsu Lisboa"
            className="h-9 w-auto sm:h-10"
          />
        </a>

        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.key}>
              <a
                href={link.href}
                className="text-sm font-medium tracking-wide text-alliance-light/70 transition-colors hover:text-alliance-yellow"
              >
                {t(link.key)}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher />
          <button
            onClick={openBooking}
            className="rounded-full bg-alliance-yellow px-5 py-2.5 text-sm font-semibold text-alliance-black transition-transform hover:scale-105 hover:bg-alliance-yellow-light"
          >
            {t("navbar.cta")}
          </button>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <LanguageSwitcher />
          <button
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="text-2xl text-alliance-light"
          >
            {menuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`lg:hidden fixed inset-x-0 top-[64px] bottom-0 z-40 bg-alliance-black/98 backdrop-blur-lg transition-all duration-300 ${
          menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <ul className="flex flex-col gap-1 px-6 py-8">
          {NAV_LINKS.map((link) => (
            <li key={link.key}>
              <a
                href={link.href}
                onClick={close}
                className="block border-b border-white/5 py-4 font-display text-2xl text-alliance-light transition-colors hover:text-alliance-yellow"
              >
                {t(link.key)}
              </a>
            </li>
          ))}
          <li className="pt-6">
            <button
              onClick={() => {
                close();
                openBooking();
              }}
              className="w-full rounded-full bg-alliance-yellow px-6 py-4 text-base font-semibold text-alliance-black"
            >
              {t("navbar.cta")}
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
}
