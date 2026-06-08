import { FaWhatsapp } from "react-icons/fa";
import { useSettings } from "../hooks/useSettings";

export default function WhatsAppFloat() {
  const { business } = useSettings();
  return (
    <a
      href={`https://wa.me/${business.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-2xl text-white shadow-lg shadow-black/30 transition-transform hover:scale-110"
    >
      <FaWhatsapp />
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-whatsapp/40" />
    </a>
  );
}
