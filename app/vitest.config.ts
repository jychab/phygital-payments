import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "lazor-kit": path.resolve(__dirname, "../clients/js/lazor_kit/src/index.ts"),
    },
  },
});
