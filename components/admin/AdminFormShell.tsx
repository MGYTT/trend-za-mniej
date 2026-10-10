import type {
  ReactNode,
} from "react";

import Link from "next/link";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  mobileBadge?:
    | string
    | null;
};

export default function AdminFormShell({
  eyebrow,
  title,
  description,
  children,
  mobileBadge = null,
}: Props) {
  return (
    <section className="admin-form-shell mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
      <div className="admin-form-heading mb-4 sm:mb-7">
        <div className="hidden items-center gap-2 text-xs font-bold text-stone-400 sm:flex">
          <Link
            href="/admin"
            className="transition hover:text-rose-600"
          >
            Panel
          </Link>

          <span>
            /
          </span>

          <span className="text-stone-600">
            {eyebrow}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 sm:mt-3 sm:items-end">
          <div className="min-w-0 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-full bg-rose-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-rose-600 sm:bg-transparent sm:p-0 sm:text-xs sm:tracking-[0.15em]">
                {eyebrow}
              </span>

              {mobileBadge && (
                <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-1.5 text-[9px] font-black text-stone-500 sm:hidden">
                  {mobileBadge}
                </span>
              )}
            </div>

            <h1 className="mt-2 text-[28px] font-black leading-none tracking-[-0.05em] text-stone-950 sm:mt-1 sm:text-4xl">
              {title}
            </h1>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-stone-500 sm:text-base sm:leading-7">
              {description}
            </p>
          </div>

          <Link
            href="/admin"
            aria-label="Wróć do panelu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-xl font-medium text-stone-500 shadow-sm transition active:scale-95 sm:hidden"
          >
            ×
          </Link>

          <Link
            href="/admin"
            className="hidden min-h-10 w-fit items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-black text-stone-600 transition hover:border-rose-200 hover:text-rose-700 sm:inline-flex"
          >
            ← Panel
          </Link>
        </div>
      </div>

      {children}
    </section>
  );
}