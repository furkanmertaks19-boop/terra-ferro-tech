import Link from "next/link";
import Image from "next/image";
import { pathFor } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

export function Logo({
  onClick,
  variant = "nav",
  locale = DEFAULT_LOCALE,
}: {
  onClick?: () => void;
  variant?: "nav" | "footer";
  locale?: Locale;
}) {
  return (
    <Link href={pathFor("home", locale)} onClick={onClick} className="inline-flex shrink-0 items-center" aria-label="Terra Ferro Tech">
      <Image
        src="/logo.png"
        alt="Terra Ferro Tech"
        width={240}
        height={240}
        priority={false}
        className={`w-auto object-contain object-left ${
          variant === "footer" ? "h-11 md:h-12" : "h-11 md:h-14"
        }`}
      />
    </Link>
  );
}
