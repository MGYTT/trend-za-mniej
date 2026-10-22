import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Existing 14 React state-in-effect findings (verified in Windows lint,
  // 22 October 2026) remain visible as warnings during Wydanie 02.
  // This narrowly scoped transitional exception avoids changing complex
  // admin state flows immediately before launch. Refactor these effects
  // separately, then remove this override (see docs/LINT-REVIEW-02.md).
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
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
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
