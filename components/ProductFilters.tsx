import Link from "next/link";

type Props = {
  categories: string[];
  query: string;
  category: string;
  maxPrice: string;
  sort: string;
};

export default function ProductFilters({
  categories,
  query,
  category,
  maxPrice,
  sort,
}: Props) {
  return (
    <form
      action="/okazje"
      method="get"
      className="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div>
          <label
            htmlFor="q"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-stone-500"
          >
            Wyszukaj
          </label>

          <input
            id="q"
            name="q"
            defaultValue={query}
            placeholder="np. sweter, koszula, jesień..."
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-stone-500"
          >
            Kategoria
          </label>

          <select
            id="category"
            name="category"
            defaultValue={
              category || "all"
            }
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          >
            <option value="all">
              Wszystkie
            </option>

            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="maxPrice"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-stone-500"
          >
            Cena do
          </label>

          <select
            id="maxPrice"
            name="maxPrice"
            defaultValue={
              maxPrice
            }
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          >
            <option value="">
              Bez limitu
            </option>

            <option value="50">
              50 zł
            </option>

            <option value="100">
              100 zł
            </option>

            <option value="150">
              150 zł
            </option>

            <option value="200">
              200 zł
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="sort"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-stone-500"
          >
            Sortuj
          </label>

          <select
            id="sort"
            name="sort"
            defaultValue={
              sort || "newest"
            }
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          >
            <option value="newest">
              Najnowsze
            </option>

            <option value="price-asc">
              Cena: rosnąco
            </option>

            <option value="price-desc">
              Cena: malejąco
            </option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Filtruj
          </button>
        </div>
      </div>

      {(query ||
        category ||
        maxPrice ||
        (sort &&
          sort !== "newest")) && (
        <div className="mt-4 border-t border-stone-100 pt-4">
          <Link
            href="/okazje"
            className="text-sm font-bold text-rose-600 hover:text-rose-700"
          >
            ✕ Wyczyść filtry
          </Link>
        </div>
      )}
    </form>
  );
}