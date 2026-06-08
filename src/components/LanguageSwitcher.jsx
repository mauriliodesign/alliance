import { useEffect, useRef, useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import { useLang } from "../i18n/LanguageContext";
import { languages } from "../i18n/translations";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = languages.find((l) => l.code === lang) ?? languages[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold tracking-wide text-alliance-light/80 transition-colors hover:border-alliance-yellow hover:text-alliance-yellow"
      >
        {current.label}
        <HiChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border border-white/10 bg-alliance-gray shadow-2xl">
          {languages.map((l) => (
            <li key={l.code}>
              <button
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                  l.code === lang ? "text-alliance-yellow" : "text-alliance-light/80"
                }`}
              >
                <span>{l.name}</span>
                <span className="text-xs opacity-60">{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
