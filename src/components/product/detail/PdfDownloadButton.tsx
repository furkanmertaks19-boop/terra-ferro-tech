"use client";

import { useState } from "react";

export default function PdfDownloadButton({
  slug,
  label,
}: {
  slug: string;
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  function handleDownload() {
    if (loading) return;
    setLoading(true);
    const a = document.createElement("a");
    a.href = `/api/products/${slug}/technical-pdf/download`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Reset after a short delay — the browser starts the download in the background
    setTimeout(() => setLoading(false), 3000);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center justify-center border border-ink/18 px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink transition hover:bg-ink hover:text-white disabled:opacity-60"
    >
      {loading ? "İndiriliyor…" : label}
    </button>
  );
}
