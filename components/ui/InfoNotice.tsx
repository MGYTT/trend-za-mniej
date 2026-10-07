import type {
  ReactNode,
} from "react";

type NoticeVariant =
  | "neutral"
  | "rose"
  | "amber"
  | "green";

type Props = {
  icon?: ReactNode;
  title?: string;
  children: ReactNode;
  variant?: NoticeVariant;
};

const variants: Record<
  NoticeVariant,
  string
> = {
  neutral:
    "border-stone-200 bg-stone-50 text-stone-600",

  rose:
    "border-rose-100 bg-rose-50/70 text-stone-600",

  amber:
    "border-amber-100 bg-amber-50/80 text-stone-600",

  green:
    "border-green-100 bg-green-50/80 text-stone-600",
};

const iconVariants: Record<
  NoticeVariant,
  string
> = {
  neutral:
    "bg-white text-stone-600",

  rose:
    "bg-white text-rose-600",

  amber:
    "bg-white text-amber-700",

  green:
    "bg-white text-green-700",
};

export default function InfoNotice({
  icon,
  title,
  children,
  variant = "neutral",
}: Props) {
  return (
    <div
      className={[
        "rounded-3xl border p-4 sm:p-5",
        variants[
          variant
        ],
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              "text-base font-black shadow-sm",
              iconVariants[
                variant
              ],
            ].join(" ")}
          >
            {icon}
          </div>
        )}

        <div className="min-w-0">
          {title && (
            <p className="font-black text-stone-900">
              {title}
            </p>
          )}

          <div
            className={[
              "text-sm leading-7",
              title
                ? "mt-1"
                : "",
            ].join(" ")}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}