import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "dist/**",
    "artifacts/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/app/**/page.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: 'JSXAttribute[name.name="className"]',
          message:
            "Pages compose design-system components. Put reusable styles in components/ui.",
        },
        {
          selector: 'JSXAttribute[name.name="style"]',
          message:
            "Use semantic design-system variants instead of page styles.",
        },
      ],
    },
  },
]);
