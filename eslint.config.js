import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // instrução para ignorar arquivos/pastas
  {
    ignores: [
      "docs/**",
      "package-lock.json"
    ]
  },
  {
    files: ["src/**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    }
  },
  {
    files: ["**/*.json"],
    ignores: ["package-lock.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"]
  },
  {
    files: ["src/**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"]
  }
]);
