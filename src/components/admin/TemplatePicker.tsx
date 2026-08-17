"use client";

import { Category } from "@prisma/client";
import type { ProductTemplateId } from "@/lib/templates";

export default function TemplatePicker({
  category,
  value,
}: {
  category: Category;
  value: ProductTemplateId;
  onChange?: (id: ProductTemplateId) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-black/60">Sayfa Tasarımı</p>
      <p className="font-medium text-brand-black">Standart Ürün Sayfası</p>
      <p className="mt-1 text-xs leading-relaxed text-black/55">
        {category === Category.TRACTOR
          ? "Traktör sayfasında HP, Stage, Kabin ve Seri bilgileri öne çıkar."
          : "Tarım makinesi sayfasında çalışma genişliği, kapasite ve bağlantı bilgileri öne çıkar."}
      </p>
      <input type="hidden" name="template" value={value} readOnly />
    </div>
  );
}
