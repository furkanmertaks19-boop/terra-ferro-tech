import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";

type Variant = "primary" | "secondary" | "gold" | "ghost" | "dark";

type Common = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
};

type LinkBtn = Common & { href: string; onClick?: never; type?: never };
type ActionBtn = Common & {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

const styles: Record<Variant, string> = {
  primary: "btn-wipe bg-tractor-red text-white border border-transparent",
  secondary: "btn-wipe btn-wipe-red border border-warm/35 bg-transparent text-warm hover:text-white",
  dark: "btn-wipe btn-wipe-dark border border-ink/20 bg-transparent text-ink hover:text-warm",
  gold: "btn-wipe bg-tractor-red text-white border border-transparent",
  ghost: "border-transparent bg-transparent text-warm hover:text-tractor-red px-0",
};

const base =
  "group inline-flex items-center justify-center gap-3 rounded-[3px] px-6 py-3.5 text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors duration-[180ms] ease-out-expo active:scale-[0.98] disabled:opacity-60";

export function Button(props: LinkBtn | ActionBtn) {
  const { children, variant = "primary", className = "", arrow } = props;
  const cls = `${base} ${styles[variant]} ${className}`;
  const content = (
    <>
      <span className="relative z-[1]">{children}</span>
      {arrow && (
        <span className="relative z-[1] grid place-items-center transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5">
          <ArrowUpRight size={14} weight="bold" />
        </span>
      )}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={cls}>
        {content}
      </Link>
    );
  }

  const action = props as ActionBtn;
  return (
    <button type={action.type ?? "button"} onClick={action.onClick} disabled={action.disabled} className={cls}>
      {content}
    </button>
  );
}
