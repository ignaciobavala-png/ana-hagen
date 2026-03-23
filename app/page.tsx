import Hero from "@/components/Hero";
import LiveSection from "@/components/LiveSection";
import MarqueeStrip from "@/components/MarqueeStrip";
import Dates from "@/components/Dates";
import Videos from "@/components/Videos";
import PlaylistSection from "@/components/PlaylistSection";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollLine from "@/components/ScrollLine";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <ScrollReveal />
      <ScrollLine />
      <Hero />
      <LiveSection />
      <MarqueeStrip />
      <Dates />
      <Videos />
      <PlaylistSection />
      <Booking />
      <Footer />
    </main>
  );
}
