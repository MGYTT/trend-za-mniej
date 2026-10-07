import { supabase } from "@/lib/supabase";

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  price: number;
  oldPrice: number | null;
  category: string;
  image: string;
  affiliateUrl: string;
  featured: boolean;
  sold: string | null;
  active: boolean;
  createdAt: string;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  description: string;
  price: number | string;
  old_price: number | string | null;
  category: string;
  image_url: string;
  affiliate_url: string;
  featured: boolean;
  sold_text: string | null;
  active: boolean;
  created_at: string;
};

export type ProductSort =
  | "newest"
  | "price-asc"
  | "price-desc";

export type ProductFilters = {
  query?: string;
  category?: string;
  maxPrice?: number;
  sort?: ProductSort;
};

function mapProduct(
  row: ProductRow
): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    description: row.description,
    price: Number(row.price),
    oldPrice:
      row.old_price === null
        ? null
        : Number(row.old_price),
    category: row.category,
    image: row.image_url,
    affiliateUrl: row.affiliate_url,
    featured: row.featured,
    sold: row.sold_text,
    active: row.active,
    createdAt: row.created_at,
  };
}

export async function getProducts(
  filters: ProductFilters = {}
): Promise<Product[]> {
  let request = supabase
    .from("products")
    .select("*")
    .eq("active", true);

  const query =
    filters.query?.trim();

  if (query) {
    const safeQuery = query.replace(
      /[,()%]/g,
      " "
    );

    request = request.or(
      `name.ilike.%${safeQuery}%,short_name.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
    );
  }

  if (
    filters.category &&
    filters.category !== "all"
  ) {
    request = request.eq(
      "category",
      filters.category
    );
  }

  if (
    typeof filters.maxPrice ===
      "number" &&
    Number.isFinite(
      filters.maxPrice
    )
  ) {
    request = request.lte(
      "price",
      filters.maxPrice
    );
  }

  switch (filters.sort) {
    case "price-asc":
      request = request.order(
        "price",
        {
          ascending: true,
        }
      );
      break;

    case "price-desc":
      request = request.order(
        "price",
        {
          ascending: false,
        }
      );
      break;

    default:
      request = request.order(
        "created_at",
        {
          ascending: false,
        }
      );
      break;
  }

  const { data, error } =
    await request;

  if (error) {
    console.error(
      "Błąd pobierania produktów:",
      error
    );

    return [];
  }

  return (
    data as ProductRow[]
  ).map(mapProduct);
}

export async function getFeaturedProducts(): Promise<
  Product[]
> {
  const { data, error } =
    await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("featured", true)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    console.error(
      "Błąd pobierania wyróżnionych produktów:",
      error
    );

    return [];
  }

  return (
    data as ProductRow[]
  ).map(mapProduct);
}

export async function getCategories(): Promise<
  string[]
> {
  const { data, error } =
    await supabase
      .from("products")
      .select("category")
      .eq("active", true)
      .order("category", {
        ascending: true,
      });

  if (error) {
    console.error(
      "Błąd pobierania kategorii:",
      error
    );

    return [];
  }

  const categories = data.map(
    (item) => item.category
  );

  return [
    ...new Set(categories),
  ];
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const { data, error } =
    await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();

  if (error) {
    console.error(
      "Błąd pobierania produktu:",
      error
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return mapProduct(
    data as ProductRow
  );
}

export async function getProductById(
  id: string
): Promise<Product | null> {
  const { data, error } =
    await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("active", true)
      .maybeSingle();

  if (error) {
    console.error(
      "Błąd pobierania produktu:",
      error
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return mapProduct(
    data as ProductRow
  );
}

export function formatPrice(
  price: number
) {
  return new Intl.NumberFormat(
    "pl-PL",
    {
      style: "currency",
      currency: "PLN",
    }
  ).format(price);
}