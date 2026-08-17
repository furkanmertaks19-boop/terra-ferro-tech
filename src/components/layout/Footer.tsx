import Link from "next/link";
import type { PublicSiteSettings } from "@/lib/site-settings";
import { NAV_LINKS } from "@/lib/site-content";
import { Logo } from "./Logo";
import FooterQuoteButton from "./FooterQuoteButton";

export default function Footer({ settings }: { settings: PublicSiteSettings }) {
  return (
    <footer className="border-t border-warm/10 bg-ink text-warm">
      <div className="container-site grid gap-8 pt-12 pb-6 md:grid-cols-12 md:gap-8 md:pt-16 md:pb-8">
        <div className="md:col-span-4">
          <Logo variant="footer" />
          <p className="mt-4 max-w-xs text-base leading-relaxed text-warm/60">
            Përfaqësues i traktorëve dhe makinerive bujqësore Armatrac në Shqipëri.
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="text-[13px] font-medium tracking-[0.18em] uppercase text-warm/45">Navigimi</p>
          <ul className="mt-3 space-y-2 text-base text-warm/75">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-tractor-red">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="text-[13px] font-medium tracking-[0.18em] uppercase text-warm/45">Kontakt</p>
          <ul className="mt-3 space-y-2 text-base leading-relaxed text-warm/75">
            <li>
              <a href={`mailto:${settings.email}`} className="transition hover:text-tractor-red">
                {settings.email}
              </a>
            </li>
            <li>
              <a href={`tel:${settings.phoneHref}`} className="transition hover:text-tractor-red">
                {settings.phone}
              </a>
            </li>
            <li>{settings.location}</li>
          </ul>
        </div>

        <div className="md:col-span-2 md:flex md:items-start md:justify-end">
          <FooterQuoteButton />
        </div>
      </div>

      <div className="border-t border-warm/10">
        <div className="container-site py-5 text-sm text-warm/40">
          <p>
            © {new Date().getFullYear()} {settings.companyName}. Të gjitha të drejtat e rezervuara.
          </p>
        </div>
      </div>
    </footer>
  );
}
