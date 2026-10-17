
import Image from "next/image";

type ProductPhotoProps = {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  fit?: "contain" | "cover";
  className?: string;
};

function canOptimize(src: string): boolean {
  if (
    src.startsWith("/") &&
    !src.startsWith("//")
  ) {
    return true;
  }

  try {
    const url = new URL(src);

    if (url.protocol !== "https:") {
      return false;
    }

    return (
      (
        url.hostname ===
          "cpbyhabvmstevjyyrgpw.supabase.co" &&
        url.pathname.startsWith(
          "/storage/v1/object/public/product-images/"
        )
      ) ||
      (
        url.hostname ===
          "trend-za-mniej.vercel.app" &&
        url.pathname.startsWith("/products/")
      )
    );
  } catch {
    return false;
  }
}

export default function ProductPhoto({
  src,
  alt,
  sizes,
  priority = false,
  fit = "contain",
  className = "",
}: ProductPhotoProps) {
  const imageUrl = src?.trim();

  const fitClass =
    fit === "cover"
      ? "object-cover"
      : "object-contain";

  const imageClass = `
    h-full w-full
    ${fitClass}
    ${className}
  `;

  if (!imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-rose-50 p-3 text-center text-xs font-semibold text-stone-500">
        Zdjęcie produktu niedostępne
      </div>
    );
  }

  if (canOptimize(imageUrl)) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes={sizes}
        quality={75}
        loading={
          priority ? "eager" : "lazy"
        }
        fetchPriority={
          priority ? "high" : "auto"
        }
        decoding="async"
        className={imageClass}
      />
    );
  }

  // Nieznana domena:
  // zachowujemy oryginalny adres,
  // bez przekazywania go do optymalizatora.

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={alt}
      loading={
        priority ? "eager" : "lazy"
      }
      fetchPriority={
        priority ? "high" : "auto"
      }
      decoding="async"
      className={imageClass}
    />
  );
}
