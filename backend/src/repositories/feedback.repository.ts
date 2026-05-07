import {all, get, run} from "../db/dbClient.js"

import type {Feedback, CreateFeedbackDto, UpdateFeedbackDto } from "../dtos/feedback.dto.js";

export class FeedbackRepository {
    async getAll(): Promise<Feedback[]> {
        const sql = `
        SELECT id, resourceId, userId, rating, comment, createdAt
        FROM Feedback
        ORDER BY createdAt DESC;
        `;
        return await all<Feedback>(sql);
    }
    async getById(id: string | number): Promise<Feedback | undefined> {
        const feedbackId = Number(id);
        const sql = `
        SELECT id, resourceId, userId, rating, comment, createdAt
        FROM Feedback
        WHERE id = ${feedbackId};
        `;
        return await get<Feedback>(sql);
    }
    async getByResource(resourceId: string | number): Promise<Feedback[]> {
        const parsedResourceid = Number(resourceId);
        const sql = `
        SELECT id, resourceId, userId, rating, comment, createdAt
        FROM Feedback
        WHERE resourceId = ${parsedResourceid}
        ORDER BY createdAt DESC;
        `;
        return await all<Feedback>(sql);
    }
    async create(dto: CreateFeedbackDto): Promise<Feedback> {
        const now = new Date().toISOString();
        const sql = `
        INSERT INTO Feedback (resourceId, userId, rating, comment, createdAt)
        VALUES (
        ${Number(dto.resourceId)},
        ${Number(dto.userId)},
        ${Number(dto.rating)},
        '${now}'
        );
        `;
        const result = await run(sql);
        const created = await this.getById(result.lastID);
        if(!created) {
            throw new Error("Failed to create feedback")
        }
        return created;
    }
    async update(id: string | number, dto: UpdateFeedbackDto): Promise<Feedback | null> {
        const feedbackId = Number(id);
        const existing = await this.getById(feedbackId);
        if(!existing) {
            return null;
        }
        const nextResourceId = dto.resourceId ?? existing.resourceId;
        const nextUserId = dto.userId ?? existing.userId;
        const nextRating = dto.rating ?? existing.rating;
        const nextComment = (dto.comment ?? existing.comment).replace(/'/g, "''");

        const sql = `
        UPDATE Feedback
        SET
            resourceId = ${Number(nextResourceId)},
            userId = ${Number(nextUserId)}
            rating = ${Number(nextRating)}
            comment = '${nextComment}'
        WHERE id = ${feedbackId};
        `;

        await run(sql);
        return (await this.getById(feedbackId)) ?? null;
    }
    async delete(id: string | number): Promise<boolean> {
        const feedbackId = Number(id);
        const sql = `DELETE FROM Feedback WHERE id = ${feedbackId};`;
        const result = await run(sql);
        return result.changes > 0;
    }
}