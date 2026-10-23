import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repositoryRoot, "");
  const apiPort = env.PORT ?? "3000";

  return {
    root: fileURLToPath(new URL(".", import.meta.url)),
    envDir: repositoryRoot,
    plugins: [react()],
    resolve: {
      alias: {
        "@wallet/contracts": fileURLToPath(
          new URL("../packages/contracts/src/common.ts", import.meta.url),
        ),
      },
    },
    server: {
      host: "127.0.0.1",
      port: 5173,
      proxy: { "/api": `http://127.0.0.1:${apiPort}` },
    },
  };
});
