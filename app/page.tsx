import Hero from "@/components/Hero";
import LiveSection from "@/components/LiveSection";
import Dates from "@/components/Dates";
import Videos from "@/components/Videos";
import PlaylistSection from "@/components/PlaylistSection";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <LiveSection />
      <Dates />
      <Videos />
      <PlaylistSection />
      <Booking />
      <Footer />
    </main>
  );
}
