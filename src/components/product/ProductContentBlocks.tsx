import type { ContentBlock } from "@/lib/admin-content";
import Image from "next/image";
import { sanitizeRichHtml } from "@/lib/sanitize";

export default function ProductContentBlocks({
  blocks,
  tone = "dark",
}: {
  blocks: ContentBlock[];
  tone?: "dark" | "light";
}) {
  if (!blocks?.length) return null;
  const body = tone === "light" ? "text-ink/70" : "text-warm/70";
  const heading = tone === "light" ? "text-ink" : "text-warm";
  const panel = tone === "light" ? "border-ink/10 bg-warm-white" : "border-warm/10 bg-surface";
  const feature = tone === "light" ? "border-ink/10" : "border-warm/10";

  return (
    <div className="mt-10 space-y-8">
      {blocks.map((block) => {
        if (block.type === "text" && block.html) {
          return <div key={block.id} className={`max-w-3xl text-base leading-relaxed ${body}`} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(block.html) }} />;
        }
        if (block.type === "image" && block.url) {
          return (
            <div key={block.id} className={`relative aspect-[16/8] overflow-hidden ${tone === "light" ? "bg-[#ece8de]" : "bg-surface"}`}>
              <Image src={block.url} alt={block.alt || ""} fill className="object-cover" sizes="1100px" />
            </div>
          );
        }
        if (block.type === "image-text") {
          return (
            <div key={block.id} className="grid gap-6 md:grid-cols-2">
              {block.url && (
                <div className={`relative min-h-56 overflow-hidden ${tone === "light" ? "bg-[#ece8de]" : "bg-surface"}`}>
                  <Image src={block.url} alt="" fill className="object-cover" sizes="600px" />
                </div>
              )}
              <div className={`text-base leading-relaxed ${body}`} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(block.html) }} />
            </div>
          );
        }
        if (block.type === "highlight") {
          return (
            <div key={block.id} className={`border px-5 py-4 ${tone === "light" ? "border-tractor-red/25 bg-warm-white" : "border-tractor-red/30 bg-surface"}`}>
              <p className={`font-display text-xl ${heading}`}>{block.title}</p>
              <p className={`mt-2 text-sm ${body}`}>{block.body}</p>
            </div>
          );
        }
        if (block.type === "features") {
          return (
            <div key={block.id} className="grid gap-3 sm:grid-cols-2">
              {block.items.filter((i) => i.title).map((item) => (
                <div key={item.id} className={`border p-4 ${feature}`}>
                  <p className={`font-medium ${heading}`}>{item.title}</p>
                  <p className={`mt-1 text-sm ${body}`}>{item.body}</p>
                </div>
              ))}
            </div>
          );
        }
        if (block.type === "cta") {
          return (
            <div key={block.id} className={`border px-5 py-6 ${panel}`}>
              <p className="font-display text-2xl text-tractor-red">{block.title}</p>
              <p className={`mt-2 text-sm ${body}`}>{block.body}</p>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
