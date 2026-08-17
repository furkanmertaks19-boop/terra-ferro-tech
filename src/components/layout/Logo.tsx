import Link from "next/link";
import Image from "next/image";

export function Logo({
  onClick,
  variant = "nav",
}: {
  onClick?: () => void;
  variant?: "nav" | "footer";
}) {
  return (
    <Link href="/" onClick={onClick} className="inline-flex shrink-0 items-center" aria-label="Terra Ferro Tech">
      <Image
        src="/logo.png"
        alt="Terra Ferro Tech"
        width={240}
        height={240}
        priority={variant === "nav"}
        className={`w-auto object-contain object-left ${
          variant === "footer" ? "h-11 md:h-12" : "h-11 md:h-14"
        }`}
      />
    </Link>
  );
}
