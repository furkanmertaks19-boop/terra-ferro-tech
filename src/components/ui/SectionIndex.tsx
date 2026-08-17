export function SectionIndex({
  index,
  label,
  tone = "dark",
}: {
  index: string;
  label: string;
  tone?: "dark" | "light";
}) {
  const number = tone === "light" ? "text-tractor-red" : "text-tractor-red";
  const text = tone === "light" ? "text-ink/55" : "text-warm/50";
  const rule = "bg-tractor-red";

  return (
    <div className="flex items-center gap-4">
      <span className={`font-display text-[13px] font-semibold tabular-nums tracking-[0.18em] ${number}`}>
        {index}
      </span>
      <span className={`h-px w-10 ${rule}`} />
      <span className={`text-[13px] font-medium tracking-[0.18em] uppercase ${text}`}>{label}</span>
    </div>
  );
}
