"use client";

import { useActionState } from "react";
import { createLead, type LeadFormState } from "@/lib/actions/leads";
import { t } from "@/lib/i18n";

const initialState: LeadFormState = { success: false };

const fieldClass =
  "w-full border border-ink/12 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-tractor-red";
const labelClass = "mb-1.5 block text-[12px] font-semibold tracking-[0.08em] uppercase text-ink/50";

export default function ContactForm({
  labels,
}: {
  labels?: {
    formTitle: string;
    submitLabel: string;
    nameLabel: string;
    phoneLabel: string;
    emailLabel: string;
    subjectLabel?: string;
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
    subjectLabel: labels?.subjectLabel || "Subjekti",
    messageLabel: labels?.messageLabel || "Mesazhi",
  };

  if (state.success) {
    return (
      <div className="border border-tractor-red/20 bg-white px-6 py-8 text-sm leading-relaxed text-ink" role="status">
        {t.quoteForm.success}
      </div>
    );
  }

  return (
    <form action={formAction} className="relative border border-ink/10 bg-white p-5 md:p-7" noValidate={false}>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">{copy.formTitle}</h2>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="company_website">Website</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field name="name" label={copy.nameLabel} required minLength={2} autoComplete="name" invalid={Boolean(state.error)} />
        <Field name="phone" label={copy.phoneLabel} type="tel" required minLength={6} autoComplete="tel" invalid={Boolean(state.error)} />
        <Field name="email" label={copy.emailLabel} type="email" autoComplete="email" invalid={Boolean(state.error)} />
        <Field name="subject" label={copy.subjectLabel} />
        <div className="sm:col-span-2">
          <label htmlFor="message" className={labelClass}>
            {copy.messageLabel}
          </label>
          <textarea id="message" name="message" rows={5} className={fieldClass} />
        </div>
      </div>
      {state.error ? (
        <p id="contact-error" className="mt-4 text-sm text-tractor-red" role="alert">
          {t.quoteForm.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-wipe mt-6 w-full bg-tractor-red py-3.5 text-[13px] font-semibold tracking-[0.08em] uppercase text-white transition hover:bg-tractor-red-dark disabled:opacity-60"
      >
        <span className="relative z-[1]">{pending ? t.quoteForm.submitting : copy.submitLabel}</span>
      </button>
    </form>
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
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? "contact-error" : undefined}
        className={fieldClass}
      />
    </div>
  );
}
