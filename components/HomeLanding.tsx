import Link from "next/link";
import ProductPhoto from "@/components/ProductPhoto";
import { STYLE_GUIDES } from "@/lib/poradniki";
import { formatPrice, type Product } from "@/lib/products";
import type { ResolvedLook } from "@/lib/stylizacje";

const BUDGETS = [100, 150, 200] as const;
const OCCASIONS = [
  { title: "Na co dzień", detail: "Codzienne zestawy bez wysiłku", icon: "✳" },
  { title: "Do pracy", detail: "Wygodny smart casual", icon: "◈" },
  { title: "Na weekend", detail: "Swobodne połączenia", icon: "☼" },
] as const;

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <span aria-hidden="true" className="shrink-0 text-lg leading-none">
      {diagonal ? "↗" : "→"}
    </span>
  );
}

function SectionHeading({
  label,
  title,
  description,
  href,
  linkLabel,
}: {
  label: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[0.17em] text-rose-700">{label}</p>
        <h2 className="mt-2 text-balance text-[clamp(1.7rem,3vw,2.6rem)] font-black leading-tight tracking-[-0.045em] text-stone-950">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">{description}</p>
      </div>
      {href && linkLabel && (
        <Link href={href} className="inline-flex min-h-11 items-center gap-2 rounded-xl font-black text-rose-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rose-600">
          {linkLabel} <Arrow />
        </Link>
      )}
    </div>
  );
}

function HeroVisual({ look }: { look?: ResolvedLook }) {
  if (!look) {
    return (
      <div className="relative flex min-h-[310px] flex-col justify-center overflow-hidden rounded-[30px] border border-rose-200 bg-gradient-to-br from-rose-100 via-orange-50 to-white p-8 shadow-[0_25px_65px_rgba(136,19,55,0.09)] sm:min-h-[400px]">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">Znajdź coś dla siebie</span>
        <p className="mt-5 max-w-xs text-4xl font-black leading-tight tracking-[-0.05em] text-stone-950">Twój pomysł na styl zaczyna się tutaj.</p>
        <Link href="/stylizacje" className="mt-8 inline-flex min-h-12 w-fit items-center gap-2 rounded-2xl bg-rose-600 px-5 text-sm font-black text-white hover:bg-rose-700">
          Przejrzyj stylizacje <Arrow />
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={`/stylizacje/${look.slug}`}
      aria-label={`Odkryj stylizację: ${look.title}`}
      className="group relative block overflow-hidden rounded-[30px] border border-rose-100 bg-white shadow-[0_25px_65px_rgba(136,19,55,0.13)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(136,19,55,0.2)] focus-visible:outline-4 focus-visible:outline-rose-400"
    >
      <div className="flex items-center justify-between gap-3 bg-white px-5 py-4 sm:px-6">
        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-rose-700">Inspiracja z katalogu</span>
        <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700">Do {look.maxBudget} zł</span>
      </div>
      <div className="grid h-[260px] grid-cols-2 gap-2 bg-[#faf2f0] p-3 sm:h-[340px] sm:gap-3 sm:p-4">
        {look.products.slice(0, 2).map((product, index) => (
          <div key={product.id} className="relative overflow-hidden rounded-[20px] bg-white">
            <ProductPhoto src={product.image} alt={product.name} sizes="(max-width: 639px) 42vw, (max-width: 1023px) 24vw, 18vw" priority={index === 0} className="p-3 transition-transform duration-500 group-hover:scale-[1.035]" />
          </div>
        ))}
      </div>
      <div className="flex items-end justify-between gap-4 px-5 py-5 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-bold text-stone-500">{look.occasion} · {look.products.length} elementy</p>
          <p className="mt-1 text-lg font-black leading-tight tracking-tight text-stone-950 group-hover:text-rose-700">{look.title}</p>
          <p className="mt-2 text-[11px] leading-5 text-stone-500">Suma cen zapisanych w katalogu, bez dostawy</p>
        </div>
        <div className="shrink-0 text-right">
          <strong className="block text-xl font-black tracking-tight text-stone-950">{formatPrice(look.total)}</strong>
          <span className="mt-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white transition group-hover:bg-rose-700"><Arrow diagonal /></span>
        </div>
      </div>
    </Link>
  );
}

function Hero({ look }: { look?: ResolvedLook }) {
  return (
    <section aria-labelledby="home-hero-title" className="relative isolate overflow-hidden border-b border-rose-100 bg-[#fff8f7]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-rose-100/80 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 left-[-10%] h-96 w-96 rounded-full bg-orange-100/60 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 lg:pb-20 lg:pt-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-rose-700 shadow-sm">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-rose-500" />
            Inspiracje, które mieszczą się w budżecie
          </p>
          <h1 id="home-hero-title" className="mt-6 max-w-2xl text-balance text-[clamp(2.8rem,5.5vw,5.5rem)] font-black leading-[1.04] tracking-[-0.065em] text-stone-950">
            Dużo stylu.<span className="mt-1 block text-rose-600">Mniej wydatków.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-stone-600 sm:text-lg">
            Zamiast szukać godzinami — odkrywaj gotowe stylizacje, modowe inspiracje i wybrane produkty. Wybierz okazję albo budżet i znajdź coś dla siebie.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/stylizacje" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-rose-600 px-6 text-sm font-black text-white shadow-[0_10px_25px_rgba(225,29,72,0.2)] transition hover:bg-rose-700 focus-visible:outline-4 focus-visible:outline-rose-300">
              Odkryj stylizacje <Arrow />
            </Link>
            <a href="#odkrywaj" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-6 text-sm font-black text-rose-800 transition hover:bg-rose-50 focus-visible:outline-4 focus-visible:outline-rose-300">
              Wybierz swój budżet ↓
            </a>
          </div>
          <form action="/okazje" method="get" role="search" className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-[0_12px_35px_rgba(28,25,23,0.06)] sm:p-2">
            <label htmlFor="home-search" className="sr-only">Wyszukaj produkty</label>
            <input id="home-search" type="search" name="q" maxLength={120} enterKeyHint="search" placeholder="Szukasz sukienki, swetra, torebki...?" className="min-h-11 min-w-0 flex-1 rounded-xl bg-transparent px-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-rose-300 sm:text-base" />
            <button type="submit" className="min-h-11 shrink-0 rounded-xl bg-stone-900 px-5 text-sm font-black text-white transition hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-rose-500">Szukaj</button>
          </form>
          <p className="mt-4 text-xs leading-6 text-stone-500">Bez konta i bez zakupów na naszej stronie. Cenę i dostępność potwierdzisz u sprzedawcy.</p>
        </div>
        <div className="mx-auto w-full max-w-[520px] lg:justify-self-end">
          <HeroVisual look={look} />
        </div>
      </div>
    </section>
  );
}

function BudgetDiscovery({ looks }: { looks: readonly ResolvedLook[] }) {
  return (
    <section id="odkrywaj" aria-labelledby="home-budget-title" className="scroll-mt-24 border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionHeading label="Szybki start" title="Ile chcesz przeznaczyć na stylizację?" description="Wybierz limit i zobacz gotowe zestawy mieszczące się w Twoim budżecie — bez przeglądania całego katalogu." />
        <div className="mt-7 grid gap-3 sm:grid-cols-3 sm:gap-5">
          {BUDGETS.map((budget, index) => {
            const count = looks.filter((look) => look.total <= budget).length;
            return (
              <Link key={budget} href={`/stylizacje?budzet=${budget}#wybierz-stylizacje`} className="group relative flex min-h-[165px] flex-col justify-between overflow-hidden rounded-[24px] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-6 transition hover:-translate-y-1 hover:border-rose-300 hover:shadow-lg focus-visible:outline-4 focus-visible:outline-rose-300">
                <span aria-hidden="true" className="absolute -right-10 -top-10 h-36 w-36 rounded-full border-[25px] border-rose-100/70 transition group-hover:scale-110" />
                <span className="relative text-xs font-black uppercase tracking-[0.15em] text-rose-700">{index === 0 ? "Mały budżet" : index === 1 ? "Złoty środek" : "Więcej możliwości"}</span>
                <span className="relative flex items-end justify-between gap-2">
                  <span>
                    <strong className="block text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">Do {budget} zł</strong>
                    <span className="mt-2 block text-xs font-medium text-stone-600">{count > 0 ? "Zobacz dopasowane zestawy" : "Sprawdź dostępne inspiracje"}</span>
                  </span>
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-rose-700 shadow-sm transition group-hover:bg-rose-600 group-hover:text-white"><Arrow diagonal /></span>
                </span>
              </Link>
            );
          })}
        </div>
        <p className="mt-4 text-xs leading-6 text-stone-500">Budżety dotyczą sumy zapisanych cen elementów zestawu. Buty, dodatki i dostawa mogą nie być wliczone — dokładny skład znajdziesz przy stylizacji.</p>
      </div>
    </section>
  );
}

function LookCard({ look }: { look: ResolvedLook }) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-[0_8px_25px_rgba(28,25,23,0.04)] transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg">
      <Link href={`/stylizacje/${look.slug}`} aria-label={`Zobacz stylizację: ${look.title}`} className="block focus-visible:outline-4 focus-visible:outline-rose-400">
        <div className="relative grid aspect-[1.7] grid-cols-2 gap-1.5 overflow-hidden bg-stone-100 p-2">
          {look.products.slice(0, 2).map((product) => (
            <div key={product.id} className="relative overflow-hidden rounded-2xl bg-white">
              <ProductPhoto src={product.image} alt={product.name} sizes="(max-width: 639px) 45vw, (max-width: 1023px) 23vw, 16vw" className="p-2 transition duration-500 group-hover:scale-105" />
            </div>
          ))}
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-rose-700 shadow-sm">Do {look.maxBudget} zł</span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700">{look.occasion} · {look.style}</p>
        <h3 className="mt-2 text-xl font-black leading-tight tracking-tight text-stone-950">
          <Link href={`/stylizacje/${look.slug}`} className="hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-rose-400">{look.title}</Link>
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">{look.intro}</p>
        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 border-t border-stone-100 pt-4">
            <span className="text-xs leading-5 text-stone-500">Suma {look.products.length} elementów<br />bez dostawy</span>
            <strong className="text-xl font-black tracking-tight text-stone-950">{formatPrice(look.total)}</strong>
          </div>
          <Link href={`/stylizacje/${look.slug}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-black text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-rose-400">
            Zobacz skład zestawu <Arrow />
          </Link>
        </div>
      </div>
    </article>
  );
}

function FeaturedLooks({ looks }: { looks: readonly ResolvedLook[] }) {
  if (!looks.length) return null;
  return (
    <section aria-labelledby="home-looks-title" className="border-b border-stone-200 bg-[#faf8f7]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionHeading label="Wybrane inspiracje" title="Zestawy, od których warto zacząć" description="Nie musisz kompletować wszystkiego od zera. Zobacz, które elementy połączyliśmy i ile wynosi suma ich cen w katalogu." href="/stylizacje" linkLabel="Wszystkie stylizacje" />
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {looks.slice(0, 3).map((look) => <LookCard key={look.slug} look={look} />)}
        </div>
      </div>
    </section>
  );
}

function OccasionDiscovery({ looks }: { looks: readonly ResolvedLook[] }) {
  const items = OCCASIONS.filter((occasion) => looks.some((look) => look.occasion === occasion.title));
  if (!items.length) return null;
  return (
    <section aria-labelledby="home-occasion-title" className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionHeading label="Dopasuj do dnia" title="Na jaką okazję szukasz pomysłu?" description="Do pracy, na spacer czy na spokojny weekend? Zacznij od okazji, a resztę wybierz po swojemu." />
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {items.map((occasion) => (
            <Link key={occasion.title} href={`/stylizacje?okazja=${encodeURIComponent(occasion.title)}#wybierz-stylizacje`} className="group flex min-h-[145px] items-center gap-4 rounded-[24px] border border-stone-200 bg-stone-50 p-5 transition hover:border-rose-300 hover:bg-rose-50 hover:shadow-md focus-visible:outline-4 focus-visible:outline-rose-300">
              <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-3xl text-rose-700">{occasion.icon}</span>
              <span className="min-w-0 flex-1">
                <strong className="block text-lg font-black text-stone-950 group-hover:text-rose-700">{occasion.title}</strong>
                <span className="mt-1 block text-xs leading-5 text-stone-500">{occasion.detail}</span>
              </span>
              <Arrow diagonal />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductSelection({ products }: { products: readonly Product[] }) {
  if (!products.length) return null;
  return (
    <section aria-labelledby="home-products-title" className="border-b border-stone-200 bg-[#faf8f7]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionHeading label="Z katalogu" title="Pojedyncze rzeczy, które warto odkryć" description="Wolisz komponować własne zestawy? Sprawdź wybrane ubrania i dodatki z naszego katalogu." href="/okazje" linkLabel="Przeglądaj katalog" />
        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4 sm:gap-5">
          {products.slice(0, 4).map((product) => (
            <article key={product.id} className="group min-w-0 overflow-hidden rounded-[22px] border border-stone-200 bg-white transition hover:-translate-y-1 hover:border-rose-300 hover:shadow-lg">
              <Link href={`/produkt/${product.slug}`} aria-label={`Zobacz produkt: ${product.shortName || product.name}`} className="flex h-full flex-col focus-visible:outline-4 focus-visible:outline-rose-400">
                <div className="relative aspect-[4/5] bg-[#f8f4f1]">
                  <ProductPhoto src={product.image} alt={product.name} sizes="(max-width: 639px) 44vw, (max-width: 1023px) 23vw, 18vw" className="p-3 transition duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-5">
                  <p className="truncate text-[10px] font-black uppercase tracking-wider text-rose-700 sm:text-xs">{product.category}</p>
                  <h3 className="mt-2 line-clamp-2 text-sm font-extrabold leading-snug text-stone-900 sm:text-base">{product.shortName?.trim() || product.name}</h3>
                  <div className="mt-auto pt-4">
                    <strong className="block text-xl font-black text-stone-950">{formatPrice(product.price)}</strong>
                    <p className="mt-1 text-[10px] leading-4 text-stone-500 sm:text-xs">Cena z katalogu</p>
                    <span className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-2 text-xs font-black text-rose-700 transition group-hover:bg-rose-600 group-hover:text-white sm:text-sm">Zobacz produkt <Arrow /></span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const DISCOVERY_PATHS = [
  { href: "/promocje-shein", label: "Promocje SHEIN", title: "Sprawdź kampanie i kupony", description: "Warunki i aktualność promocji potwierdzaj bezpośrednio w sklepie.", accent: "bg-rose-50 border-rose-100", mark: "%" },
  { href: "/tiktok", label: "Inspiracje społeczności", title: "Odkryj produkty z TikToka", description: "Zobacz produkty wyróżniane w naszej sekcji TikTok.", accent: "bg-orange-50 border-orange-100", mark: "↗" },
  { href: "/poradniki", label: "Praktyczna wiedza", title: "Wybieraj z większą pewnością", description: "Sprawdź, jak łączyć fasony, dopasować rozmiar i planować zakupy.", accent: "bg-stone-100 border-stone-200", mark: "?" },
] as const;

function MoreWaysToDiscover() {
  return (
    <section aria-labelledby="home-more-title" className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionHeading label="Więcej do odkrycia" title="Każdy ma swój sposób na inspiracje" description="Wolisz promocje, trendy czy konkretne porady? Wybierz ścieżkę, która najbardziej Ci pasuje." />
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {DISCOVERY_PATHS.map((item) => (
            <Link key={item.href} href={item.href} className={`group flex min-h-[225px] flex-col rounded-[25px] border p-6 transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-4 focus-visible:outline-rose-300 ${item.accent}`}>
              <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl font-black text-rose-700 shadow-sm">{item.mark}</span>
              <span className="mt-5 text-[11px] font-black uppercase tracking-wider text-rose-700">{item.label}</span>
              <strong className="mt-1 text-xl font-black leading-tight tracking-tight text-stone-950">{item.title}</strong>
              <span className="mt-2 text-sm leading-6 text-stone-600">{item.description}</span>
              <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-black text-rose-700">Odkryj więcej <Arrow /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Guides() {
  if (!STYLE_GUIDES.length) return null;
  return (
    <section aria-labelledby="home-guides-title" className="border-b border-stone-200 bg-[#faf8f7]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionHeading label="Poradniki" title="Nie wiesz, od czego zacząć?" description="Praktyczne wskazówki o fasonach, rozmiarach i łączeniu ubrań, zanim wybierzesz ofertę." href="/poradniki" linkLabel="Wszystkie poradniki" />
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {STYLE_GUIDES.slice(0, 3).map((guide) => (
            <Link key={guide.slug} href={`/poradniki/${guide.slug}`} className="group flex min-h-[205px] flex-col rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-rose-300 hover:shadow-md focus-visible:outline-4 focus-visible:outline-rose-300">
              <span className="text-xs font-black uppercase tracking-wider text-rose-700">{guide.category}</span>
              <strong className="mt-3 text-lg font-black leading-snug text-stone-950 group-hover:text-rose-700">{guide.title}</strong>
              <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-rose-700">Czytaj poradnik <Arrow /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section aria-labelledby="home-trust-title" className="bg-stone-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-300">Tak działa Trend za Mniej</p>
        <h2 id="home-trust-title" className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Odkrywaj. Porównuj. Wybieraj.</h2>
        <div className="mt-8 grid gap-6 border-t border-white/15 pt-7 md:grid-cols-3">
          {[
            { number: "01", title: "Zainspiruj się", detail: "Znajdź gotowy zestaw lub produkt, który pasuje do Twoich planów." },
            { number: "02", title: "Sprawdź szczegóły", detail: "Porównaj skład zestawu i sumę cen zapisanych w naszym katalogu." },
            { number: "03", title: "Kup świadomie", detail: "Potwierdź cenę, rozmiar i dostawę bezpośrednio u sprzedawcy." },
          ].map((step) => (
            <div key={step.number}>
              <span className="text-2xl font-black text-rose-300">{step.number}</span>
              <h3 className="mt-3 text-lg font-black">{step.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-7 text-stone-300">{step.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 border-t border-white/15 pt-5 text-xs leading-6 text-stone-300">
          Trend za Mniej nie sprzedaje produktów. Część linków ma charakter afiliacyjny — możemy otrzymać prowizję od kwalifikujących się zakupów. <Link href="/afiliacja" className="font-black text-white underline underline-offset-4 hover:text-rose-200">Dowiedz się więcej o afiliacji.</Link>
        </p>
      </div>
    </section>
  );
}

export default function HomeLanding({
  looks,
  products,
}: {
  looks: readonly ResolvedLook[];
  products: readonly Product[];
}) {
  const heroLook = looks.find((look) => look.occasion === "Na co dzień" && look.products.length >= 2) ?? looks.find((look) => look.products.length >= 2);
  return (
    <>
      <Hero look={heroLook} />
      <BudgetDiscovery looks={looks} />
      <FeaturedLooks looks={looks} />
      <OccasionDiscovery looks={looks} />
      <MoreWaysToDiscover />
      <ProductSelection products={products} />
      <Guides />
      <TrustStrip />
    </>
  );
}
