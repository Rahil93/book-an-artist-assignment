import { connectMySQL } from "./mysql.js";
import { connectMongoDB } from "./mongodb.js";
import { runMigrations } from "./migrate.js";

export const connectDatabases = async () => {
    await Promise.all([
        connectMySQL(),
        connectMongoDB(),
    ]);

    await runMigrations();

    console.log("All databases connected successfully");
}
