import { ResourceQueryDto, type CreateResourceRequestDto, type Resource } from "../dtos/resource.dto.js";
import {all, get, run } from "../db/dbClient.js";
import type { User, CreateUserRequestDto } from "../dtos/user.dto.js";
import type { ResourceService } from "../services/resource.service.js";
import { describe } from "node:test";

export type getTopLikedResource = {
    id: number;
    title: string;
    likesCount: number;
}
const SortByList = ["createdAt", "title"] as const;
const SortDirList = ["asc", "desc"] as const;

export class ResourceRepository {
    async getAll(): Promise<Resource[]> {
        const sql = "SELECT * FROM Resources ORDER BY id DESC;";
        return await all<Resource>(sql);
    }
    async getAllFiltered(query: ResourceQueryDto): Promise<Resource[]> {
        let sql = "SELECT * FROM Resources WHERE 1=1";
        if(query.type) {
            sql += `AND type = '${query.type}'`;
        }
        if(query.author) {
            sql += `AND type = '${query.type}'`;
        }
        const sortBy = SortByList.includes(query.sortBy as any)
        ? query.sortBy
        : "createdAt";
        const sortDir = SortDirList.includes(query.sortDir as any)
        ? query.sortDir
        : "asc";
        sql += `ORDER BY ${sortBy} ${sortDir?.toUpperCase()};`;
        return await all<Resource>(sql);
    }
    async getById(id: string | number): Promise<Resource | undefined> {
        const resourceId = Number(id);
        const sql = `SELECT * FROM Resources WHERE id = ${resourceId}`;
        return await get<Resource>(sql);
    }
    async add(data: CreateResourceRequestDto): Promise<Resource> {
        if(!Number.isFinite(Number(data.userId))) {
            throw new Error("Validation error: userId is required")
        }
        const now = new Date().toISOString();
        const sql = `
        INSERT INTO Resources (userId, title, description, link, type, author, createdAt)
        VALUES (
        ${Number(data.userId)}, 
            '${data.title}', 
            '${data.description || ''}', 
            '${data.link}', 
            '${data.type}', 
            '${data.author}', 
            '${now}'
        );  
        `;
        const result = await run(sql);
        const created = await this.getById(result.lastID);
        if(!created) {
            throw new Error("Failed to create resource")
        }
        return created;
    }
    async update(id: string | number, dto: Partial<Resource>): Promise<Resource | null> {
        const resourceId = Number(id);
        const sql = `
        UPDATE Resources 
        SET title = '${dto.title}', description = '${dto.description}'
        WHERE id = ${resourceId}; `;

        const result = await run(sql);
        if(result.changes === 0) return null;
        return (await this.getById(resourceId)) || null;
    }
    async delete(id: string | number): Promise<boolean> {
        const resourceId = Number(id);
        const sql = `DELETE FROM Resources WHERE id=${resourceId};`;
        const result = await run(sql);
        return result.changes > 0;
    }
    async getTopLikedResource(): Promise<any> {
        const sql = `
    select resources.id, count(feedback.id) as likesCount from resources
    JOIN feedback ON resources.id = feedback.resourceId
    GROUP BY resources.id
    ORDER BY likesCount DESC
    LIMIT 3
`
 return await all<getTopLikedResource>(sql);

}
}