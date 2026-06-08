import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Programs from "./components/Programs";
import TrialSteps from "./components/TrialSteps";
import Coach from "./components/Coach";
import Method from "./components/Method";
import Schedule from "./components/Schedule";
import Pricing from "./components/Pricing";
import Reopen from "./components/Reopen";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";
import WhatsAppFloat from "./components/WhatsAppFloat";

export default function App() {
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
