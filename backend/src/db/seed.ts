import { migrate } from "./migrate.js";
import { run } from "./dbClient.js";

async function seed() {
    await migrate();
    const now = new Date().toISOString();

    await run(`INSERT OR IGNORE INTO Users (email, name, role, createdAt)
        VALUES ('alice@example.com', 'Alice', 'student', '${now}');`);
    await run(`INSERT OR IGNORE INTO Users (email, name, role, createdAt)
        VALUES ('bob@example.com', 'Bob', 'student', '${now}');`);

    await run(`INSERT OR IGNORE INTO Resources (userId, title, description, link, type, author, createdAt)
        VALUES (1, 'Clean Code', 'Book about writing clean code', 'https://example.com/1', 'book', 'Robert Martin', '${now}');`);
    await run(`INSERT OR IGNORE INTO Resources (userId, title, description, link, type, author, createdAt)
        VALUES (2, 'MDN Docs', 'Web docs', 'https://developer.mozilla.org', 'article', 'Mozilla', '${now}');`);

    await run(`INSERT OR IGNORE INTO Feedback (userId, resourceId, rating, comment, createdAt)
        VALUES (1, 1, 5, 'Great book!', '${now}');`);
    await run(`INSERT OR IGNORE INTO Feedback (userId, resourceId, rating, comment, createdAt)
        VALUES (2, 2, 5, 'Best book!', '${now}');`);
    await run(`INSERT OR IGNORE INTO Feedback (userId, resourceId, rating, comment, createdAt)
        VALUES (1, 2, 4, 'helpful!', '${now}');`);

    console.log("Seed completed");
}

seed().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
});