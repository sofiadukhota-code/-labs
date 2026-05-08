import { all, get, run } from "../db/dbClient.js";
import type { CreateResourceRequestDto, Resource, ResourceQueryDto } from "../dtos/resource.dto.js";
import { FeedbackRepository } from "./feedback.repository.js";

type TopLikedResourceRow = {
    id: number;
    title: string;
    likesCount: number;
    avgRating: number;
};

const SORT_BY_LIST = ["createdAt", "title"] as const;
const SORT_DIR_LIST = ["asc", "desc"] as const;

export class ResourceRepository {
    async getAll(): Promise<Resource[]> {
        const sql = `
            SELECT id, userId, title, description, link, type, author, createdAt
            FROM Resources
            ORDER BY createdAt DESC;
        `;
        return await all<Resource>(sql);
    }
    async getAllFiltered(query: ResourceQueryDto): Promise<Resource[]> {
        const conditions: string[] = [];

        if (query.type) {
            conditions.push(`type = '${query.type}'`);
        }

        if (query.author) {
            const escapedAuthor = query.author.replace(/'/g, "''");
            conditions.push(`author = '${escapedAuthor}'`);
        }

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

        const sortBy = SORT_BY_LIST.includes(query.sortBy as any)
            ? query.sortBy
            : "createdAt";

        const sortDir = SORT_DIR_LIST.includes(query.sortDir as any)
            ? query.sortDir
            : "desc";

        const sql = `
            SELECT id, userId, title, description, link, type, author, createdAt
            FROM Resources
            ${whereClause}
            ORDER BY ${sortBy} ${sortDir.toUpperCase()};
        `;

        return await all<Resource>(sql);
    }
    async getById(id: string | number): Promise<Resource | undefined> {
        const resourceId = Number(id);
        const sql = `
            SELECT id, userId, title, description, link, type, author, createdAt
            FROM Resources
            WHERE id = ${resourceId};
        `;
        return await get<Resource>(sql);
    }
    async add(data: CreateResourceRequestDto): Promise<Resource> {
        const now = new Date().toISOString();

        const escapedTitle = data.title.replace(/'/g, "''");
        const escapedDescription = (data.description ?? "").replace(/'/g, "''");
        const escapedLink = data.link.replace(/'/g, "''");
        const escapedAuthor = data.author.replace(/'/g, "''");

        const sql = `
            INSERT INTO Resources (userId, title, description, link, type, author, createdAt)
            VALUES (
                ${Number(data.userId)},
                '${escapedTitle}',
                '${escapedDescription}',
                '${escapedLink}',
                '${data.type}',
                '${escapedAuthor}',
                '${now}'
            );
        `;

        const result = await run(sql);
        const created = await this.getById(result.lastID);

        if (!created) {
            const err = new Error("Failed to create resource") as Error & {
                status?: number;
                code?: string;
            };
            err.status = 500;
            err.code = "DB_WRITE_FAILED";
            throw err;
        }

        return created;
    }
    async update(id: string | number, dto: Partial<Resource>): Promise<Resource | null> {
        const resourceId = Number(id);
        const existing = await this.getById(resourceId);

        if (!existing) {
            return null;
        }

        const nextTitle = (dto.title ?? existing.title).replace(/'/g, "''");
        const nextDescription = (dto.description ?? existing.description).replace(/'/g, "''");
        const nextLink = (dto.link ?? existing.link).replace(/'/g, "''");
        const nextType = dto.type ?? existing.type;
        const nextAuthor = (dto.author ?? existing.author).replace(/'/g, "''");
        const nextUserId = dto.userId ?? existing.userId;

        const sql = `
            UPDATE Resources
            SET
                userId = ${Number(nextUserId)},
                title = '${nextTitle}',
                description = '${nextDescription}',
                link = '${nextLink}',
                type = '${nextType}',
                author = '${nextAuthor}'
            WHERE id = ${resourceId};
        `;

        const result = await run(sql);

        if (result.changes === 0) {
            return null;
        }

        return (await this.getById(resourceId)) ?? null;
    }
    async delete(id: string | number): Promise<boolean> {
        const resourceId = Number(id);
        const sql = `DELETE FROM Resources WHERE id = ${resourceId};`;
        const result = await run(sql);
        return result.changes > 0;
    }
    async getTopLikedResource(): Promise<TopLikedResourceRow[]> {
        const sql = `
            SELECT
                Resources.id,
                Resources.title,
                COUNT(Feedback.id) AS likesCount,
                AVG(Feedback.rating) AS avgRating
            FROM Resources
            JOIN Feedback ON Resources.id = Feedback.resourceId
            GROUP BY Resources.id, Resources.title
            ORDER BY likesCount DESC, avgRating DESC
            LIMIT 3;
        `;

        return await all<TopLikedResourceRow>(sql);
    }
    async getAllWithFeedback() {
    const resources = await this.getAll();
    const feedbackRepo = new FeedbackRepository();
    
    const result = [];
    for (const resource of resources) {
        const feedbacks = await feedbackRepo.getByResource(resource.id);
        result.push({ ...resource, feedbacks });
    }
    return result;
}
}