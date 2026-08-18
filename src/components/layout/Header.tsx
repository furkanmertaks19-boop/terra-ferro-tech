"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { publicNavLinks } from "@/lib/site-content";
import { useQuote } from "@/components/quote/QuoteProvider";
import type { PublicSiteSettings } from "@/lib/site-settings";
import { DURATION, EASE } from "@/lib/motion";

export default function Header({ settings }: { settings: PublicSiteSettings }) {
  const pathname = usePathname();
  const { openQuote } = useQuote();
  const links = publicNavLinks(settings.usedTractorsEnabled);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const last = useRef(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 12;
    if (next !== last.current) {
      last.current = next;
      setScrolled(next);
    }
  });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Kalo te përmbajtja
      </a>
      <header className="fixed inset-x-0 top-0 z-[50]">
        <div
          className={`border-b transition-[background-color,box-shadow,border-color] duration-300 ease-out-expo ${
            open
              ? "border-ink/8 bg-ivory"
              : scrolled
                ? "border-ink/10 bg-white/92 shadow-[0_10px_30px_rgb(17_19_21_/_0.06)] backdrop-blur-md"
                : "border-ink/8 bg-white/80 backdrop-blur-sm"
          }`}
        >
          <div className="mx-auto flex min-h-[72px] max-w-[1480px] items-center justify-between gap-6 px-5 md:min-h-[78px] md:px-8">
            <Logo />

            <nav
              className="pointer-events-none absolute inset-x-0 hidden justify-center min-[1180px]:flex"
              aria-label="Kryesore"
            >
              <div className="pointer-events-auto flex items-center gap-1 xl:gap-2">
                {links.map((link) => {
                  const active =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      data-active={active}
                      className={`nav-link px-2 py-2 text-[12px] font-medium tracking-[0.02em] whitespace-nowrap transition-colors duration-[180ms] xl:px-3 ${
                        active ? "text-tractor-red" : "text-ink/70 hover:text-ink"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openQuote()}
                className="btn-wipe hidden rounded-[3px] bg-tractor-red px-5 py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-white sm:inline-flex"
              >
                <span className="relative z-[1]">Kërko Ofertë</span>
              </button>

              <button
                type="button"
                className="grid h-11 w-11 place-items-center border border-ink/15 text-ink min-[1180px]:hidden"
                aria-label={open ? "Mbyll menunë" : "Hap menunë"}
                aria-expanded={open}
                aria-controls="mobile-nav"
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X size={20} /> : <List size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[48] bg-ivory min-[1180px]:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: reduce ? 0.2 : DURATION.slow, ease: EASE }}
          >
            <nav id="mobile-nav" className="flex h-dvh flex-col px-6 pb-8 pt-24" aria-label="Menuja e lëvizshme">
              <ul className="flex-1 space-y-1">
                {links.map((link, i) => {
                  const active =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <motion.li
                      key={link.href}
                      initial={{ y: "110%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.05 * i, duration: DURATION.slow, ease: EASE }}
                      className="overflow-hidden border-b border-ink/10"
                    >
                      <Link
                        href={link.href}
                        className="flex items-baseline gap-4 py-3"
                        onClick={() => setOpen(false)}
                      >
                        <span className="font-display text-sm tabular-nums text-tractor-red">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`font-display text-4xl font-semibold tracking-tight sm:text-5xl ${
                            active ? "text-tractor-red" : "text-ink"
                          }`}
                        >
                          {link.label}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="mt-8 space-y-2 text-sm text-ink/65">
                <a href={`tel:${settings.phoneHref}`} className="block hover:text-tractor-red">
                  {settings.phone}
                </a>
                <a href={`mailto:${settings.email}`} className="block hover:text-tractor-red">
                  {settings.email}
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openQuote();
                }}
                className="btn-wipe mt-6 w-full rounded-[3px] bg-tractor-red py-4 text-[13px] font-semibold tracking-[0.12em] uppercase text-white"
              >
                <span className="relative z-[1]">Kërko Ofertë</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
