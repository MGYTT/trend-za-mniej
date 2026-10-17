
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,

  images: {
    formats: ["image/webp"],

    qualities: [75],

    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "cpbyhabvmstevjyyrgpw.supabase.co",
        pathname:
          "/storage/v1/object/public/product-images/**",
      },

      {
        protocol: "https",
        hostname:
          "trend-za-mniej.vercel.app",
        pathname: "/products/**",
      },
    ],
  },
};

export default nextConfig;
