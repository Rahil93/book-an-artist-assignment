import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { db } from "./mysql.js";

const migrationsFolder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../drizzle");

// Applies any pending SQL files from ./drizzle (tracked in __drizzle_migrations), so it is safe to run on every start.
export async function runMigrations() {
    await migrate(db, { migrationsFolder });
    console.log("MySQL migrations up to date");
}
