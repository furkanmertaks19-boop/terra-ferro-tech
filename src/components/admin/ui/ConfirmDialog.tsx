"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ConfirmOpts = {
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
};

const ConfirmCtx = createContext<{ confirm: (opts: ConfirmOpts) => Promise<boolean> } | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error("ConfirmProvider missing");
  return ctx.confirm;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<ConfirmOpts | null>(null);
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOpts) => {
    setOpen(opts);
    return new Promise<boolean>((resolve) => setResolver(() => resolve));
  }, []);

  function close(value: boolean) {
    resolver?.(value);
    setResolver(null);
    setOpen(null);
  }

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmCtx.Provider value={value}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/55" aria-label="Kapat" onClick={() => close(false)} />
          <div role="dialog" aria-modal="true" className="admin-glass relative w-full max-w-md rounded-[14px] p-5">
            <h2 className="font-display text-xl font-semibold">{open.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--admin-text-2)]">{open.body}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => close(false)}>
                İptal
              </button>
              <button
                type="button"
                className={`admin-btn ${open.danger ? "admin-btn-danger" : "admin-btn-primary"}`}
                onClick={() => close(true)}
              >
                {open.confirmLabel ?? "Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}
