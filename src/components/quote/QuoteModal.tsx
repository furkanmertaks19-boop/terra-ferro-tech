"use client";

import { useActionState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { createLead, type LeadFormState } from "@/lib/actions/leads";
import { t } from "@/lib/i18n";
import { useQuote } from "./QuoteProvider";

const initialState: LeadFormState = { success: false };

export default function QuoteModal() {
  const { open, closeQuote, productId, productLabel, contact } = useQuote();
  const reduce = useReducedMotion();
  const [state, formAction, pending] = useActionState(createLead, initialState);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeQuote();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, closeQuote]);

  const whatsappText = encodeURIComponent(
    productLabel
      ? `Përshëndetje, jam i interesuar për ${productLabel}.`
      : "Përshëndetje, dua informacion për ofertë."
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <motion.button
            type="button"
            aria-label="Mbyll"
            className="absolute inset-0 bg-ink/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeQuote}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-title"
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-warm/10 bg-ink-2 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-warm/10 px-6 py-5">
              <div>
                <p className="text-[11px] tracking-[0.22em] uppercase text-metal">Terra Ferro Tech</p>
                <h2 id="quote-title" className="mt-1 font-display text-2xl font-semibold text-warm">
                  {t.quoteForm.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeQuote}
                className="grid h-11 w-11 place-items-center border border-warm/15 text-warm hover:border-tractor-red hover:text-tractor-red"
                aria-label="Mbyll formularin"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {state.success ? (
                <p className="border border-tractor-red/30 bg-tractor-red/10 px-4 py-5 text-sm leading-relaxed text-warm">
                  {t.quoteForm.success}
                </p>
              ) : (
                <form action={formAction} className="space-y-4">
                  {productId && <input type="hidden" name="productId" value={productId} />}
                  {productLabel && (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-warm-muted">{t.quoteForm.product}</label>
                      <input
                        readOnly
                        value={productLabel}
                        className="w-full border border-warm/15 bg-ink px-3 py-2.5 text-sm text-warm"
                      />
                    </div>
                  )}
                  <Field name="name" label={t.quoteForm.name} required minLength={2} />
                  <Field name="phone" label={t.quoteForm.phone} type="tel" required minLength={6} />
                  <Field name="email" label={t.quoteForm.email} type="email" />
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-warm-muted">
                      {t.quoteForm.message}
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      className="w-full border border-warm/15 bg-ink px-3 py-2.5 text-sm text-warm placeholder:text-warm/30 focus:border-tractor-red focus:outline-none"
                    />
                  </div>
                  {state.error && <p className="text-sm text-brand-red">{t.quoteForm.error}</p>}
                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full bg-brand-red px-4 py-3.5 text-[13px] font-semibold tracking-[0.08em] uppercase text-white transition hover:bg-brand-red-dark disabled:opacity-60"
                  >
                    {pending ? t.quoteForm.submitting : t.quoteForm.submit}
                  </button>
                </form>
              )}

              <a
                href={`https://wa.me/${contact.whatsapp}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block text-center text-sm text-warm-muted underline-offset-4 hover:text-tractor-red hover:underline"
              >
                {t.quoteForm.orWhatsapp}
              </a>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  minLength,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-xs font-medium text-warm-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        className="w-full border border-warm/15 bg-ink px-3 py-2.5 text-sm text-warm focus:border-tractor-red focus:outline-none"
      />
    </div>
  );
}
