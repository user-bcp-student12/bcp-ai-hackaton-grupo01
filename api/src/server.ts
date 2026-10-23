import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildApp } from "./app.js";
import { loadConfig } from "./shared/config.js";

const config = loadConfig();
const builtIndex = new URL("../../web/dist/index.html", import.meta.url);
const webDirectory = existsSync(builtIndex)
  ? fileURLToPath(new URL(".", builtIndex))
  : undefined;
const app = await buildApp({ config, webDirectory });
await app.listen({ host: config.HOST, port: config.PORT });
