import { type Resource } from "../dtos/resource.dto.js";
import {all, get, run } from "../db/dbClient.js";
import type { User, CreateUserRequestDto } from "../dtos/user.dto.js";
import type { ResourceService } from "../services/resource.service.js";
import { describe } from "node:test";

export class  UserRepository {
    async getAll(): Promise<User[]> {
        const sql = "SELECT id, email, name, createdAt FROM Users ORDER BY id DESC;";
        return await all<User>(sql);
    }
    async getById(id: string | number): Promise<User | undefined> {
        const userId = Number(id);
        const sql = `SELECT id, email, name, createdAt FROM Users WHERE id = ${userId};`;
        return await get<User>(sql);
    }
    async create(data: CreateUserRequestDto): Promise<User> {
        const now = new Date().toISOString();
        const sql = `
        INSERT INTO Users (email, name, createdAt)
        VALUES ('${data.email}', '${data.username}', '${now}')`;

        const result = await run(sql);

        const created = await this.getById(result.lastID);
        if(!created) throw new Error("creating user error");
        return created;
    }
}

export class ResourceRepository {
    async getAll(): Promise<Resource[]> {
        const sql = "SELECT * FROM Resources ORDER BY id DESC;";
        return await all<Resource>(sql);
    }
    async getById(id: string | number): Promise<Resource | undefined> {
        const resourceId = Number(id);
        const sql = `SELECT * FROM Resources WHERE id = ${resourceId}`;
        return await get<Resource>(sql);
    }
    async add(data: Partial<Resource>): Promise<Resource> {
        const now = new Date().toISOString();
        const sql = `
        INSERT INTO Resources (userId, title, description, createdAt)
        VALUES (${Number(data.userId)}, '${data.title}', '${data.description}', '${now}')
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
}
