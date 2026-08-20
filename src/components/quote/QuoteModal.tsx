"use client";

import { useActionState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { createLead, type LeadFormState } from "@/lib/actions/leads";
import { useT, useLocale } from "@/components/i18n/LocaleProvider";
import { useQuote } from "./QuoteProvider";

const initialState: LeadFormState = { success: false };

const fieldClass =
  "w-full border border-ink/12 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-tractor-red";
const labelClass = "mb-1.5 block text-[12px] font-semibold tracking-[0.08em] uppercase text-ink/50";

export default function QuoteModal() {
  const t = useT();
  const locale = useLocale();
  const { open, closeQuote, productId, usedTractorId, productLabel, contact } = useQuote();
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
    productLabel ? t.quoteForm.whatsappInterest.replace("{product}", productLabel) : t.quoteForm.whatsappGeneric,
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <motion.button
            type="button"
            aria-label={t.quoteForm.close}
            className="absolute inset-0 bg-ink/50"
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
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-ink/10 bg-ivory shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-ink/10 bg-white px-6 py-5">
              <div>
                <p className="text-[11px] tracking-[0.22em] uppercase text-ink/40">Terra Ferro Tech</p>
                <h2 id="quote-title" className="mt-1 font-display text-2xl font-semibold text-ink">
                  {t.quoteForm.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeQuote}
                className="grid h-11 w-11 place-items-center border border-ink/15 text-ink hover:border-tractor-red hover:text-tractor-red"
                aria-label={t.quoteForm.close}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {state.success ? (
                <p className="border border-tractor-red/20 bg-white px-4 py-5 text-sm leading-relaxed text-ink" role="status">
                  {t.quoteForm.success}
                </p>
              ) : (
                <form action={formAction} className="relative space-y-4">
                  <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
                    <label htmlFor="company_website">Website</label>
                    <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
                  </div>
                  {productId && <input type="hidden" name="productId" value={productId} />}
                  {usedTractorId && <input type="hidden" name="usedTractorId" value={usedTractorId} />}
                  <input type="hidden" name="locale" value={locale} />
                  {productLabel && (
                    <div>
                      <label htmlFor="quote-product" className={labelClass}>
                        {t.quoteForm.product}
                      </label>
                      <input
                        id="quote-product"
                        readOnly
                        value={productLabel}
                        className={`${fieldClass} bg-[#f7f5ef]`}
                      />
                    </div>
                  )}
                  <Field name="name" label={t.quoteForm.name} required minLength={2} autoComplete="name" invalid={Boolean(state.error)} />
                  <Field name="phone" label={t.quoteForm.phone} type="tel" required minLength={6} autoComplete="tel" invalid={Boolean(state.error)} />
                  <Field name="email" label={t.quoteForm.email} type="email" autoComplete="email" invalid={Boolean(state.error)} />
                  <div>
                    <label htmlFor="message" className={labelClass}>
                      {t.quoteForm.message}
                    </label>
                    <textarea id="message" name="message" rows={4} className={fieldClass} />
                  </div>
                  {state.error ? (
                    <p id="quote-error" className="text-sm text-tractor-red" role="alert">
                      {t.quoteForm.error}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full bg-tractor-red px-4 py-3.5 text-[13px] font-semibold tracking-[0.08em] uppercase text-white transition hover:bg-tractor-red-dark disabled:opacity-60"
                  >
                    {pending ? t.quoteForm.submitting : t.quoteForm.submit}
                  </button>
                </form>
              )}

              <a
                href={`https://wa.me/${contact.whatsapp}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block text-center text-sm text-ink/55 underline-offset-4 hover:text-tractor-red hover:underline"
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
  autoComplete,
  invalid,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  invalid?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
        {required ? <span className="ml-1 text-tractor-red">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? "quote-error" : undefined}
        className={fieldClass}
      />
    </div>
  );
}
