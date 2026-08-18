"use client";

import { useActionState } from "react";
import { createLead, type LeadFormState } from "@/lib/actions/leads";
import { t } from "@/lib/i18n";
import { useQuote } from "@/components/quote/QuoteProvider";

const initialState: LeadFormState = { success: false };

export default function QuoteForm({
  productId,
  usedTractorId,
  productLabel,
}: {
  productId?: string;
  usedTractorId?: string;
  productLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(createLead, initialState);
  const { contact } = useQuote();

  const whatsappText = encodeURIComponent(
    productLabel ? `Përshëndetje, jam i interesuar për ${productLabel}.` : "Përshëndetje, dua informacion."
  );

  if (state.success) {
    return (
      <div className="rounded-lg border border-brand-gold/40 bg-brand-gold/10 p-5 text-sm text-brand-black">
        {t.quoteForm.success}
      </div>
    );
  }

  return (
    <div id="oferte" className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-brand-black">{t.quoteForm.title}</h3>
      <p className="mt-1 text-sm text-black/60">{t.quoteForm.subtitle}</p>

      <form action={formAction} className="relative mt-4 space-y-3">
        {productId && <input type="hidden" name="productId" value={productId} />}
        {usedTractorId && <input type="hidden" name="usedTractorId" value={usedTractorId} />}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
          <label htmlFor="company_website">Website</label>
          <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <label htmlFor="quote-name" className="mb-1 block text-xs font-medium text-black/70">
            {t.quoteForm.name}
          </label>
          <input
            id="quote-name"
            name="name"
            required
            minLength={2}
            className="w-full rounded border border-black/15 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="quote-phone" className="mb-1 block text-xs font-medium text-black/70">
            {t.quoteForm.phone}
          </label>
          <input
            id="quote-phone"
            name="phone"
            type="tel"
            required
            minLength={6}
            className="w-full rounded border border-black/15 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="quote-email" className="mb-1 block text-xs font-medium text-black/70">
            {t.quoteForm.email}
          </label>
          <input
            id="quote-email"
            name="email"
            type="email"
            className="w-full rounded border border-black/15 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="quote-message" className="mb-1 block text-xs font-medium text-black/70">
            {t.quoteForm.message}
          </label>
          <textarea
            id="quote-message"
            name="message"
            rows={3}
            className="w-full rounded border border-black/15 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
        </div>

        {state.error && (
          <p className="text-sm text-brand-red">{t.quoteForm.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-brand-red px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-red-dark disabled:opacity-60"
        >
          {pending ? t.quoteForm.submitting : t.quoteForm.submit}
        </button>
      </form>

      <div className="mt-4 border-t border-black/10 pt-4 text-center">
        <a
          href={`https://wa.me/${contact.whatsapp}?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-green-700 hover:underline"
        >
          {t.quoteForm.orWhatsapp} →
        </a>
      </div>
    </div>
  );
}
