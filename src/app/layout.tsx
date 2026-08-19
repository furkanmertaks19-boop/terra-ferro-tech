import type { Metadata, Viewport } from "next";
import { Archivo, Barlow_Condensed, Inter, Manrope } from "next/font/google";
import "./globals.css";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  isProductionIndexingEnabled,
  robotsDirective,
} from "@/lib/seo";
import { headers } from "next/headers";
import { LOCALE_HTML, isLocale, LOCALE_HEADER } from "@/lib/i18n/config";

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
});

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const viewport: Viewport = {
  themeColor: "#F6F3EC",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "agriculture",
  alternates: { canonical: "/" },
  robots: robotsDirective(isProductionIndexingEnabled()),
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "sq_AL",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [absoluteUrl("/opengraph-image")],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const localeHeader = (await headers()).get(LOCALE_HEADER);
  const locale = isLocale(localeHeader) ? localeHeader : "sq";
  return (
    <html
      lang={LOCALE_HTML[locale]}
      className={`${barlow.variable} ${inter.variable} ${archivo.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ivory font-sans text-ink">{children}</body>
    </html>
  );
}
