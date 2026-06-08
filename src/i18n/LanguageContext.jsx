import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext(null);

const SUPPORTED = ["pt", "en", "es"];

function detectInitial() {
  if (typeof window === "undefined") return "pt";
  const saved = localStorage.getItem("ajj-lang");
  if (saved && SUPPORTED.includes(saved)) return saved;
  const nav = (navigator.language || "pt").slice(0, 2).toLowerCase();
  return SUPPORTED.includes(nav) ? nav : "pt";
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(detectInitial);

  useEffect(() => {
    localStorage.setItem("ajj-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => translations[lang]?.[key] ?? translations.pt[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
