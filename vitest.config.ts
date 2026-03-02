import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/", "tests/", "dist/"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["app/**/*.ts", "components/**/*.tsx", "lib/**/*.ts"],
      exclude: [
        "node_modules/",
        "tests/",
        "*.test.*",
        "*.config.*",
        "components/ui/", // shadcn/ui - vendor code
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
