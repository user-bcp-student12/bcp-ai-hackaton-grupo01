import type { DatabaseSync } from "node:sqlite";

export const demoSeeds: readonly ((database: DatabaseSync) => void)[] = [];
