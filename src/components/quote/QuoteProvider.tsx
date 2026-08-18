"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { PublicSiteSettings } from "@/lib/site-settings";

type QuoteContextValue = {
  open: boolean;
  productId?: string;
  usedTractorId?: string;
  productLabel?: string;
  contact: PublicSiteSettings;
  openQuote: (opts?: { productId?: string; usedTractorId?: string; productLabel?: string }) => void;
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
  const [usedTractorId, setUsedTractorId] = useState<string>();
  const [productLabel, setProductLabel] = useState<string>();

  const openQuote = useCallback((opts?: { productId?: string; usedTractorId?: string; productLabel?: string }) => {
    setProductId(opts?.usedTractorId ? undefined : opts?.productId);
    setUsedTractorId(opts?.usedTractorId);
    setProductLabel(opts?.productLabel);
    setOpen(true);
  }, []);

  const closeQuote = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, productId, usedTractorId, productLabel, contact, openQuote, closeQuote }),
    [open, productId, usedTractorId, productLabel, contact, openQuote, closeQuote]
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used within QuoteProvider");
  return ctx;
}
