import type {
  ReactNode,
} from "react";

import Link from "next/link";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function AdminFormShell({
  eyebrow,
  title,
  description,
  children,
}: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="mb-5 sm:mb-7">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-400">
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

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-rose-600">
              {eyebrow}
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-stone-900 sm:text-4xl">
              {title}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base sm:leading-7">
              {description}
            </p>
          </div>

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