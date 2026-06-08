import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Programs from "../components/Programs";
import TrialSteps from "../components/TrialSteps";
import Coach from "../components/Coach";
import Method from "../components/Method";
import Schedule from "../components/Schedule";
import Pricing from "../components/Pricing";
import Reopen from "../components/Reopen";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import BookingModal from "../components/BookingModal";
import WhatsAppFloat from "../components/WhatsAppFloat";

export default function Home() {
  const { hash } = useLocation();

  // Scroll to anchor when arriving with a hash (e.g. /#aula-experimental)
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [hash]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Programs />
        <TrialSteps />
        <Coach />
        <Method />
        <Schedule />
        <Pricing />
        <Reopen />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppFloat />
      <BookingModal />
    </>
  );
}
