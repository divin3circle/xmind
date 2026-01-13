import Agents from "@/components/agents";
import CTA from "@/components/cta";
import Currency from "@/components/currency";
import Features from "@/components/features";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Steps from "@/components/steps";

export default function page() {
  return (
    <div className="max-w-7xl mx-auto my-0">
      <Navbar />
      <Hero />
      <Features />
      <Currency />
      <Agents />
      <Steps />
      <CTA />
      <Footer />
    </div>
  );
}
