import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends(
    "plugin:turbo/recommended",
    "next/core-web-vitals",
    "next"
  ),
  {
    settings: {
      next: {
        rootDir: ["apps/web/"]
      }
    }
  }
];
