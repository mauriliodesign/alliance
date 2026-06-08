import { HiArrowUp, HiPhone, HiLocationMarker, HiMail } from "react-icons/hi";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useLang } from "../i18n/LanguageContext";
import { useBooking } from "./BookingContext";
import { usePublicBusiness } from "../hooks/usePublicBusiness";

const LINKS = [
  { key: "navbar.programs", href: "#programas" },
  { key: "navbar.trialClass", href: "#aula-experimental" },
  { key: "navbar.team", href: "#equipa" },
  { key: "navbar.schedule", href: "#horarios" },
  { key: "navbar.pricing", href: "#precos" },
  { key: "navbar.faq", href: "#faq" },
];

export default function Footer() {
  const { t } = useLang();
  const { openBooking } = useBooking();
  const business = usePublicBusiness();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/8 bg-alliance-black">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <img
              src="/brand/logo-alliance-team.png"
              alt="Alliance Jiu Jitsu Lisboa"
              className="h-14 w-auto"
            />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-alliance-light/55">
              {t("footer.brand")}
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={`https://wa.me/${business.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-lg text-alliance-light/70 transition-colors hover:border-whatsapp hover:text-whatsapp"
              >
                <FaWhatsapp />
              </a>
              <a
                href={`https://www.instagram.com/${business.instagram}/`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-lg text-alliance-light/70 transition-colors hover:border-alliance-yellow hover:text-alliance-yellow"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg tracking-wide text-alliance-light">
              {t("footer.linksTitle")}
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {LINKS.map((l) => (
                <li key={l.key}>
                  <a
                    href={l.href}
                    className="text-sm text-alliance-light/55 transition-colors hover:text-alliance-yellow"
                  >
                    {t(l.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg tracking-wide text-alliance-light">
              {t("footer.contactTitle")}
            </h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-alliance-light/55">
              <li className="flex items-start gap-2.5">
                <HiLocationMarker className="mt-0.5 shrink-0 text-base text-alliance-yellow" />
                {business.address}
              </li>
              <li>
                <a
                  href={`tel:${business.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2.5 transition-colors hover:text-alliance-yellow"
                >
                  <HiPhone className="shrink-0 text-base text-alliance-yellow" />
                  {business.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-2.5 transition-colors hover:text-alliance-yellow"
                >
                  <HiMail className="shrink-0 text-base text-alliance-yellow" />
                  {business.email}
                </a>
              </li>
            </ul>
            <button
              onClick={openBooking}
              className="mt-5 rounded-full bg-alliance-yellow px-5 py-2.5 text-sm font-semibold text-alliance-black transition-colors hover:bg-alliance-yellow-light"
            >
              {t("footer.cta")}
            </button>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-xs text-alliance-light/40">
            © {year} {t("footer.copyright")}
          </p>
          <a
            href="#top"
            className="inline-flex items-center gap-2 text-xs font-medium text-alliance-light/50 transition-colors hover:text-alliance-yellow"
          >
            <HiArrowUp />
            {t("footer.backToTop")}
          </a>
        </div>
      </div>
    </footer>
  );
}
