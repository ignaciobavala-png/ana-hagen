import type { Metadata } from "next";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ana Hagen · DJ",
  description:
    "Ana Hagen — DJ from Buenos Aires. Minimal Techno, House, Techno. Booking & upcoming dates.",
  openGraph: {
    title: "Ana Hagen · DJ",
    description: "DJ from Buenos Aires. Minimal Techno · House · Techno.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${bebasNeue.variable} ${spaceGrotesk.variable}`}>
      <body className="grain">{children}</body>
    </html>
  );
}
