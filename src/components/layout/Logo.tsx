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
  const isFooter = variant === "footer";

  return (
    <Link href={pathFor("home", locale)} onClick={onClick} className="inline-flex shrink-0 items-center" aria-label="Terra Ferro Tech">
      {isFooter ? (
        <Image
          src="/logo.png"
          alt="Terra Ferro Tech"
          width={240}
          height={240}
          className="h-11 w-auto object-contain object-left md:h-12"
        />
      ) : (
        <span className="relative block h-12 w-12 md:h-16 md:w-16">
          <Image
            src="/logo.png"
            alt="Terra Ferro Tech"
            width={240}
            height={240}
            priority
            sizes="(max-width: 767px) 48px, 64px"
            className="h-full w-full object-contain"
          />
        </span>
      )}
    </Link>
  );
}
