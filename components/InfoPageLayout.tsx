import type {
  ReactNode,
} from "react";

import Link from "next/link";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

type InfoPageLayoutProps = {
  eyebrow: string;
  title: string;
  lead: string;
  activePath:
    | "/o-nas"
    | "/afiliacja"
    | "/polityka-prywatnosci"
    | "/kontakt";
  children: ReactNode;
  structuredData?: Record<
    string,
    unknown
  >;
};

const INFO_NAVIGATION = [
  {
    label: "O nas",
    href: "/o-nas",
  },
  {
    label: "Afiliacja",
    href: "/afiliacja",
  },
  {
    label: "Prywatność",
    href:
      "/polityka-prywatnosci",
  },
  {
    label: "Kontakt",
    href: "/kontakt",
  },
] as const;

export default function InfoPageLayout({
  eyebrow,
  title,
  lead,
  activePath,
  children,
  structuredData,
}: InfoPageLayoutProps) {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                structuredData
              ).replace(
                /</g,
                "\\u003c"
              ),
          }}
        />
      )}

      <SiteHeader />

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600 sm:text-sm">
              {eyebrow}
            </p>

            <h1 className="mt-3 text-balance text-4xl font-black leading-[1.06] tracking-[-0.04em] text-stone-900 sm:text-5xl">
              {title}
            </h1>

            <p className="mt-5 max-w-3xl text-pretty text-base leading-8 text-stone-500 sm:text-lg">
              {lead}
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-[64px] z-30 border-b border-stone-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <nav
            aria-label="Strony informacyjne"
            className="horizontal-scroll -mx-5 flex gap-1 overflow-x-auto px-5 py-2 sm:mx-0 sm:px-0"
          >
            {INFO_NAVIGATION.map(
              (
                item
              ) => {
                const active =
                  item.href ===
                  activePath;

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                    className={[
                      "inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-bold transition",
                      active
                        ? "bg-rose-50 text-rose-700"
                        : "text-stone-500 hover:bg-stone-50 hover:text-stone-900",
                    ].join(
                      " "
                    )}
                  >
                    {
                      item.label
                    }
                  </Link>
                );
              }
            )}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-9 sm:px-6 sm:py-12 lg:py-14">
        {children}
      </div>

      <SiteFooter />
    </main>
  );
}

export function InfoSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-36 border-b border-stone-200 py-8 first:pt-0 last:border-b-0 last:pb-0 sm:py-10"
    >
      <h2 className="text-2xl font-black tracking-[-0.03em] text-stone-900 sm:text-3xl">
        {title}
      </h2>

      <div className="mt-4 space-y-4 text-[15px] leading-7 text-stone-600 sm:text-base sm:leading-8">
        {children}
      </div>
    </section>
  );
}

export function InfoNotice({
  title,
  children,
  tone = "neutral",
}: {
  title: string;
  children: ReactNode;
  tone?:
    | "neutral"
    | "rose"
    | "amber";
}) {
  const styles = {
    neutral:
      "border-stone-200 bg-white",
    rose:
      "border-rose-100 bg-rose-50",
    amber:
      "border-amber-100 bg-amber-50",
  };

  return (
    <div
      className={[
        "rounded-[22px] border p-5 sm:p-6",
        styles[
          tone
        ],
      ].join(
        " "
      )}
    >
      <h2 className="text-lg font-black text-stone-900">
        {title}
      </h2>

      <div className="mt-2 text-sm leading-7 text-stone-600">
        {children}
      </div>
    </div>
  );
}