import { Router } from "express";
import { ResourceRepository } from "../repositories/resource.repository.js";
import { run, all } from "../db/dbClient.js";

const router = Router();
const repo = new ResourceRepository();

router.get("/resources", async (req, res, next) => {
    try {
        const data = await repo.getAllWithFeedback();
        res.json({ exported_at: new Date().toISOString(), count: data.length, data });
    } catch (e) { next(e); }
});

router.post("/resources", async (req, res, next) => {
    try {
        const items = req.body;

        if (!Array.isArray(items)) {
            return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Body must be an array" } });
        }

        if (items.length > 50) {
            return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Max 50 items per import" } });
        }

        const imported = [];
        const skipped = [];

        for (const item of items) {
            if (!item.title || !item.link || !item.type || !item.author || !item.userId) {
                skipped.push({ item, reason: "Missing required fields" });
                continue;
            }

            const now = new Date().toISOString();
            const escapedTitle = String(item.title).replace(/'/g, "''");
            const escapedLink = String(item.link).replace(/'/g, "''");
            const escapedAuthor = String(item.author).replace(/'/g, "''");
            const escapedDesc = String(item.description ?? "").replace(/'/g, "''");

            try {
                const result = await run(`
                    INSERT INTO Resources (userId, title, description, link, type, author, createdAt)
                    VALUES (
                        ${Number(item.userId)},
                        '${escapedTitle}',
                        '${escapedDesc}',
                        '${escapedLink}',
                        '${item.type}',
                        '${escapedAuthor}',
                        '${now}'
                    );
                `);
                imported.push(result.lastID);
            } catch (err: any) {
                skipped.push({ item, reason: err.message });
            }
        }

        res.status(201).json({
            message: `Imported ${imported.length}, skipped ${skipped.length}`,
            imported_ids: imported,
            skipped
        });
    } catch (e) { next(e); }
});

export default router;