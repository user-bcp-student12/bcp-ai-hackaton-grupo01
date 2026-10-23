import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@wallet/contracts": fileURLToPath(
        new URL("./packages/contracts/src/common.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["api/src/**/*.test.ts", "web/src/**/*.test.tsx"],
    environment: "node",
  },
});
