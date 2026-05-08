import fs from "fs";
import path from "path";
import { run, all, exec } from "./dbClient.js";

type MigrationRow = { filename: string};

export async function migrate(): Promise<void> {
    await run("PRAGMA foreign_keys = ON");  
    await run(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL UNIQUE,
            appliedAt TEXT NOT NULL
        )
        `)  
        
    const migrationsDir = path.join(process.cwd(), "src/db/migrations");

    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith(".sql"))
        .sort()

    const applied = await all<MigrationRow>("Select filename FROM schema_migrations");
    const appliedSet = new Set(applied.map(m => m.filename));

    for (const file of files) {
        if(!appliedSet.has(file)) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
            await exec(sql);
            await run(`
                INSERT INTO schema_migrations (filename, appliedAt)
                VALUES ('${file}', '${new Date().toISOString()}');
                `)
        }
    }     
}