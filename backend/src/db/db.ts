import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";

const sqlite = sqlite3.verbose();
const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "app.db");

if(!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true});
}

const db = new sqlite.Database(dbPath, (err) => {
    if(err) {
        console.error("Error. Cannot open sql base: ", err.message);
        process.exit(1);
    }
    console.log("sql path: ", dbPath);
})

export { db };