"use client";

import { useActionState } from "react";
import { createLead, type LeadFormState } from "@/lib/actions/leads";
import { t } from "@/lib/i18n";

const initialState: LeadFormState = { success: false };

export default function ContactForm({
  labels,
}: {
  labels?: {
    formTitle: string;
    submitLabel: string;
    nameLabel: string;
    phoneLabel: string;
    emailLabel: string;
    messageLabel: string;
  };
}) {
  const [state, formAction, pending] = useActionState(createLead, initialState);
  const copy = {
    formTitle: labels?.formTitle || "Dërgoni një mesazh",
    submitLabel: labels?.submitLabel || "Dërgo",
    nameLabel: labels?.nameLabel || "Emri dhe mbiemri",
    phoneLabel: labels?.phoneLabel || "Telefoni",
    emailLabel: labels?.emailLabel || "Email",
    messageLabel: labels?.messageLabel || "Mesazhi",
  };

  if (state.success) {
    return (
      <div className="border border-tractor-red/30 bg-tractor-red/10 p-8 text-sm leading-relaxed text-warm">
        {t.quoteForm.success}
      </div>
    );
  }

  return (
    <form action={formAction} className="relative border border-warm/10 bg-surface p-6 md:p-8">
      <h2 className="font-display text-2xl font-semibold text-warm">{copy.formTitle}</h2>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="company_website">Website</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="mt-6 space-y-4">
        <Field name="name" label={copy.nameLabel} required minLength={2} />
        <Field name="phone" label={copy.phoneLabel} type="tel" required minLength={6} />
        <Field name="email" label={copy.emailLabel} type="email" />
        <div>
          <label htmlFor="message" className="mb-1.5 block text-xs text-warm-muted">
            {copy.messageLabel}
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className="w-full border border-warm/15 bg-ink px-3 py-2.5 text-sm text-warm focus:border-tractor-red focus:outline-none"
          />
        </div>
        {state.error && <p className="text-sm text-brand-red">{t.quoteForm.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-brand-red py-3.5 text-[13px] font-semibold tracking-[0.08em] uppercase text-white transition hover:bg-brand-red-dark disabled:opacity-60"
        >
          {pending ? t.quoteForm.submitting : copy.submitLabel}
        </button>
      </div>
    </form>
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
      <label htmlFor={name} className="mb-1.5 block text-xs text-warm-muted">
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
