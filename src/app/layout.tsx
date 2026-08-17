import type { Metadata } from "next";
import { Archivo, Barlow_Condensed, Inter, Manrope } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Terra Ferro Tech | Traktorë & Makineri Bujqësore",
    template: "%s | Terra Ferro Tech",
  },
  description:
    "Terra Ferro Tech — përfaqësues i traktorëve dhe makinerive bujqësore Armatrac në Shqipëri.",
  metadataBase: new URL("https://www.terraferrotech.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="sq"
      className={`${barlow.variable} ${inter.variable} ${archivo.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink font-sans text-warm">{children}</body>
    </html>
  );
}
