import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Temporary, narrowly scoped existing React lint findings.
  // Do not disable the rule globally; older admin flows remain warnings until refactored.
  {
    files: [
      "app/admin/nowa-oferta/page.tsx",
      "components/SiteHeader.tsx",
      "components/admin/AdminAppShell.tsx",
      "components/admin/AdminHeader.tsx",
      "components/admin/AdminProductList.tsx",
      "components/admin/AdminSeoQualityManager.tsx",
      "components/admin/AdminTikTokManager.tsx",
      "components/admin/PublishConfirmation.tsx",
      "components/admin/SocialMediaStudio.tsx",
    ],
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
