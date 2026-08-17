"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { NAV_LINKS } from "@/lib/site-content";
import { useQuote } from "@/components/quote/QuoteProvider";
import type { PublicSiteSettings } from "@/lib/site-settings";
import { DURATION, EASE } from "@/lib/motion";

export default function Header({ settings }: { settings: PublicSiteSettings }) {
  const pathname = usePathname();
  const { openQuote } = useQuote();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const last = useRef(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 32;
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

  const catalogChrome = pathname.startsWith("/traktoret") || pathname.startsWith("/makineri-bujqesore");
  const morph = (scrolled || catalogChrome) && !open;

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-[50] ${morph ? "px-4 pt-3 md:px-6" : "px-0 pt-0"}`}>
        <div
          className={`relative mx-auto flex max-w-[1480px] items-center justify-between gap-6 px-5 transition-[background-color,border-color,box-shadow,backdrop-filter,min-height,border-radius] duration-[360ms] ease-out-expo md:px-8 ${
            morph
              ? "min-h-[68px] rounded-[12px] border border-warm/10 bg-graphite/88 shadow-[0_18px_40px_rgb(0_0_0_/_0.28)] backdrop-blur-md"
              : open
                ? "min-h-[92px] border border-transparent bg-ink"
                : "min-h-[92px] border border-transparent bg-transparent"
          }`}
        >
          <Logo />

          <nav
            className="pointer-events-none absolute inset-x-0 hidden justify-center min-[1180px]:flex"
            aria-label="Kryesore"
          >
            <div className="pointer-events-auto flex items-center gap-3 xl:gap-5">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-active={active}
                    className={`nav-link text-[12px] font-medium tracking-[0.01em] whitespace-nowrap transition-colors duration-[180ms] ${
                      active ? "text-warm" : "text-warm/70 hover:text-warm"
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
              className="grid h-11 w-11 place-items-center border border-warm/20 text-warm min-[1180px]:hidden"
              aria-label={open ? "Mbyll menunë" : "Hap menunë"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} /> : <List size={20} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[48] bg-ink min-[1180px]:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: reduce ? 0.2 : DURATION.slow, ease: EASE }}
          >
            <nav className="flex h-dvh flex-col px-6 pb-8 pt-28">
              <ul className="flex-1 space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.06 * i, duration: DURATION.slow, ease: EASE }}
                    className="overflow-hidden border-b border-warm/10"
                  >
                    <Link
                      href={link.href}
                      className="flex items-baseline gap-4 py-3"
                      onClick={() => setOpen(false)}
                    >
                      <span className="font-display text-sm tabular-nums text-tractor-red">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-4xl font-semibold tracking-tight text-warm sm:text-5xl">
                        {link.label}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8 space-y-2 text-sm text-warm/70">
                <a href={`tel:${settings.phoneHref}`} className="block hover:text-warm">
                  {settings.phone}
                </a>
                <a href={`mailto:${settings.email}`} className="block hover:text-warm">
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
