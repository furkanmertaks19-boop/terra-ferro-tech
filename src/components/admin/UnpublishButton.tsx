"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { unpublishProduct } from "@/lib/actions/products";

export default function UnpublishButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await unpublishProduct(id);
          router.refresh();
        });
      }}
      className="rounded border border-black/15 px-3 py-1.5 text-xs hover:bg-neutral-50 disabled:opacity-50"
    >
      {pending ? "..." : "Yayından kaldır"}
    </button>
  );
}
