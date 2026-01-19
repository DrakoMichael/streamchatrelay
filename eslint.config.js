import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 🔒 Ignorar completamente código gerado / vendor
  {
    ignores: [
      "docs/**",
      "package-lock.json"
    ]
  },

  // 🟢 Seu código (Node + Browser moderno)
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

  // 🟡 JSON (exceto lockfile)
  {
    files: ["**/*.json"],
    ignores: ["package-lock.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"]
  },

  // 🟡 CSS do projeto (não docs)
  {
    files: ["src/**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"]
  }
]);
