import Link from "next/link";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  centered?: boolean;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div
      className={[
        "flex gap-5",
        centered
          ? "flex-col items-center text-center"
          : "flex-col sm:flex-row sm:items-end sm:justify-between",
      ].join(" ")}
    >
      <div
        className={[
          centered
            ? "max-w-2xl"
            : "max-w-2xl",
        ].join(" ")}
      >
        {eyebrow && (
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600 sm:text-sm">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-2 text-balance text-2xl font-black tracking-[-0.025em] text-stone-900 sm:text-3xl lg:text-4xl">
          {title}
        </h2>

        {description && (
          <p className="mt-3 text-pretty text-sm leading-7 text-stone-500 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {actionLabel &&
        actionHref && (
          <Link
            href={actionHref}
            className={[
              "shrink-0 items-center justify-center rounded-full",
              "border border-stone-200 bg-white px-5 py-2.5",
              "text-sm font-black text-rose-600 shadow-sm",
              "transition hover:border-rose-200 hover:bg-rose-50",
              centered
                ? "inline-flex"
                : "hidden sm:inline-flex",
            ].join(" ")}
          >
            {actionLabel}
            <span
              aria-hidden="true"
              className="ml-2"
            >
              →
            </span>
          </Link>
        )}
    </div>
  );
}