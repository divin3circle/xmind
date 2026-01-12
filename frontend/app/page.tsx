import Agents from "@/components/agents";
import Currency from "@/components/currency";
import Features from "@/components/features";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";

export default function page() {
  return (
    <div className="max-w-7xl mx-auto my-0">
      <Navbar />
      <Hero />
      <Features />
      <Currency />
      <Agents />
    </div>
  );
}
