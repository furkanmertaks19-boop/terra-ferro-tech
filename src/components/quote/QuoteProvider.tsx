"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { PublicSiteSettings } from "@/lib/site-settings";

type QuoteContextValue = {
  open: boolean;
  productId?: string;
  productLabel?: string;
  contact: PublicSiteSettings;
  openQuote: (opts?: { productId?: string; productLabel?: string }) => void;
  closeQuote: () => void;
};

const QuoteContext = createContext<QuoteContextValue | null>(null);

export function QuoteProvider({
  children,
  contact,
}: {
  children: React.ReactNode;
  contact: PublicSiteSettings;
}) {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState<string>();
  const [productLabel, setProductLabel] = useState<string>();

  const openQuote = useCallback((opts?: { productId?: string; productLabel?: string }) => {
    setProductId(opts?.productId);
    setProductLabel(opts?.productLabel);
    setOpen(true);
  }, []);

  const closeQuote = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, productId, productLabel, contact, openQuote, closeQuote }),
    [open, productId, productLabel, contact, openQuote, closeQuote]
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used within QuoteProvider");
  return ctx;
}
