"use client";

import { useRef, useState } from "react";
import { FilePdf } from "@phosphor-icons/react";
import { useConfirm } from "../ui/ConfirmDialog";
import { useToast } from "../ui/Toast";
import { uploadPdfWithProgress } from "./upload";
import { CLIENT_MAX_PDF_BYTES, CLIENT_MAX_PDF_MB } from "@/lib/upload-limits";

export type TechnicalPdfValue = {
  url: string | null;
  publicId: string | null;
  name: string | null;
  size: number | null;
  show: boolean;
};

function formatSize(bytes: number | null) {
  if (bytes == null || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TechnicalPdfField({
  value,
  onChange,
}: {
  value: TechnicalPdfValue;
  onChange: (next: TechnicalPdfValue) => void;
}) {
  const { push } = useToast();
  const confirm = useConfirm();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFiles(files: FileList | File[]) {
    const file = Array.from(files)[0];
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      push("Yalnızca PDF dosyaları yüklenebilir.", "error");
      return;
    }
    if (file.size > CLIENT_MAX_PDF_BYTES) {
      push(`PDF dosyası en fazla ${CLIENT_MAX_PDF_MB} MB olabilir.`, "error");
      return;
    }
    setProgress(0);
    const result = await uploadPdfWithProgress(file, setProgress);
    setProgress(null);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    onChange({
      url: result.url,
      publicId: result.publicId,
      name: result.name,
      size: result.size,
      show: true,
    });
    push("PDF yüklendi ve sitede gösterilecek. Kaydetmeyi unutmayın.");
  }

  async function remove() {
    const ok = await confirm({
      title: "Teknik doküman kaldırılsın mı?",
      body: "Bu PDF artık ürün sayfasında kullanılamayacak.",
      confirmLabel: "Dokümanı Kaldır",
      danger: true,
    });
    if (!ok) return;
    onChange({ url: null, publicId: null, name: null, size: null, show: false });
  }

  return (
    <div className="mt-8 border-t border-[var(--admin-border)] pt-6">
      <p className="admin-label">Teknik Doküman</p>
      <p className="mb-3 text-sm text-[var(--admin-text-2)]">
        Ürüne ait katalog, teknik föy veya kullanım dokümanı ekleyebilirsiniz.
      </p>

      {value.url ? (
        <div className="rounded-[12px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-[rgb(216_169_54/0.12)] text-[var(--admin-accent)]">
              <FilePdf size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{value.name || "teknik-dokuman.pdf"}</p>
              {formatSize(value.size) ? (
                <p className="mt-0.5 text-xs text-[var(--admin-muted)]">{formatSize(value.size)}</p>
              ) : null}
              <p className="mt-1 text-xs text-[var(--admin-muted)]">
                {value.show ? "● Teknik doküman hazır" : "Doküman yüklü · Web sitesinde gizli"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={value.url}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn-ghost min-h-8 px-3 text-xs"
            >
              Görüntüle
            </a>
            <button type="button" className="admin-btn admin-btn-ghost min-h-8 px-3 text-xs" onClick={() => inputRef.current?.click()}>
              Değiştir
            </button>
            <button type="button" className="admin-btn admin-btn-ghost min-h-8 px-3 text-xs text-[var(--admin-danger)]" onClick={() => void remove()}>
              Sil
            </button>
          </div>
          {progress != null ? <p className="mt-3 text-sm text-[var(--admin-accent-2)]">Yükleniyor %{progress}</p> : null}
        </div>
      ) : (
        <label
          htmlFor="technical-pdf-file"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
          }}
          className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed px-4 text-center text-sm ${
            dragging ? "border-[var(--admin-accent)] bg-[rgb(216_169_54/0.08)]" : "border-[var(--admin-border-strong)] bg-[var(--admin-surface)]"
          }`}
        >
          <span className="text-[var(--admin-text-2)]">PDF dosyasını buraya sürükleyin</span>
          <span className="mt-1 text-[var(--admin-muted)]">veya</span>
          <span className="mt-2 admin-btn admin-btn-ghost min-h-8 px-3 text-xs">Dosya Seç</span>
          {progress != null ? <span className="mt-3 text-[var(--admin-accent-2)]">Yükleniyor %{progress}</span> : null}
        </label>
      )}

      <input
        id="technical-pdf-file"
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <label className="mt-4 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={value.show}
          onChange={(e) => onChange({ ...value, show: e.target.checked })}
        />
        <span>
          Web sitesinde teknik dokümanı göster
          <span className="mt-0.5 block text-xs text-[var(--admin-muted)]">
            PDF yüklendiğinde otomatik açılır. Gizlemek için işareti kaldırın.
          </span>
        </span>
      </label>
    </div>
  );
}
