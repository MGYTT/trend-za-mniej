import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  compact?: boolean;
};

export default function BrandLogo({
  href = "/",
  compact = false,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label="Trend za Mniej - strona główna"
      className="group inline-flex items-center gap-3"
    >
      <span
        className={[
          "relative flex shrink-0 items-center justify-center overflow-hidden",
          "bg-gradient-to-br from-rose-400 via-pink-500 to-orange-400",
          "shadow-sm ring-1 ring-rose-200 transition duration-300",
          "group-hover:-rotate-2 group-hover:scale-105 group-hover:shadow-md",
          compact
            ? "h-10 w-10 rounded-xl"
            : "h-12 w-12 rounded-2xl",
        ].join(" ")}
      >
        <span
          className={[
            "flex items-center justify-center bg-rose-50 font-black text-rose-700",
            compact
              ? "h-8 w-8 rounded-lg text-2xl"
              : "h-10 w-10 rounded-xl text-3xl",
          ].join(" ")}
        >
          T
        </span>

        <span
          className={[
            "absolute flex items-center justify-center rounded-lg bg-rose-600 font-black text-white",
            "ring-2 ring-rose-50",
            compact
              ? "-bottom-0.5 -right-0.5 h-4 w-5 text-[9px]"
              : "-bottom-0.5 -right-0.5 h-5 w-6 text-[11px]",
          ].join(" ")}
        >
          ♥
        </span>

        <span
          className={[
            "absolute rounded-full bg-amber-300",
            compact
              ? "left-1.5 top-1.5 h-1.5 w-1.5"
              : "left-2 top-2 h-2 w-2",
          ].join(" ")}
        />
      </span>

      <span className="flex flex-col leading-none">
        <span
          className={[
            "font-black tracking-tight text-stone-900 transition group-hover:text-rose-600",
            compact
              ? "text-lg"
              : "text-xl sm:text-2xl",
          ].join(" ")}
        >
          Trend za Mniej
        </span>

        <span
          className={[
            "mt-1 font-medium text-stone-500",
            compact
              ? "text-[10px]"
              : "text-xs",
          ].join(" ")}
        >
          Moda i okazje
        </span>
      </span>
    </Link>
  );
}