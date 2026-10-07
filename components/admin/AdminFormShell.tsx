import Link from "next/link";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function AdminFormShell({
  eyebrow,
  title,
  description,
  children,
}: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600 sm:text-sm">
            {eyebrow}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-stone-900 sm:text-4xl">
            {title}
          </h1>

          <p className="mt-2 text-sm leading-7 text-stone-500 sm:text-base">
            {description}
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 text-sm font-black text-stone-700 shadow-sm transition hover:border-rose-200 hover:text-rose-700"
        >
          ← Wróć do panelu
        </Link>
      </div>

      {children}
    </section>
  );
}