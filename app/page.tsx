import Hero from "@/components/Hero";
import LiveSection from "@/components/LiveSection";
import MarqueeStrip from "@/components/MarqueeStrip";
import Dates from "@/components/Dates";
import Videos from "@/components/Videos";
import Gallery from "@/components/Gallery";
import PlaylistSection from "@/components/PlaylistSection";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <ScrollReveal />
      <Hero />
      <LiveSection />
      <Dates />
      <Videos />
      <Gallery />
      <PlaylistSection />
      <MarqueeStrip />
      <Booking />
      <Footer />
    </main>
  );
}
