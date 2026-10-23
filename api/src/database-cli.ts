import { z } from "zod";
import { demoSeeds } from "./seeds.js";
import { loadConfig } from "./shared/config.js";
import {
  migrationsDirectory,
  openDatabase,
  runSeeds,
} from "./shared/database.js";

const command = z.enum(["migrate", "seed"]).parse(process.argv[2]);
const database = openDatabase(loadConfig().DATABASE_PATH, migrationsDirectory);
try {
  if (command === "seed") runSeeds(database, demoSeeds);
  process.stdout.write(
    command === "seed"
      ? `Demo seed runner completed (${String(demoSeeds.length)} registered seeds).\n`
      : "Migrations completed.\n",
  );
} finally {
  database.close();
}
