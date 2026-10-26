
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Previously published test-extension URLs now lead to the coupons catalog.
  async redirects() {
    return [
      {
        source: "/wtyczka-chrome",
        destination: "/kody-rabatowe",
        permanent: false,
      },
      {
        source: "/downloads/trendzamniej-chrome-0.5.0.zip",
        destination: "/kody-rabatowe",
        permanent: false,
      },
    ];
  },

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
