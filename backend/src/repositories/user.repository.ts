import {all, get, run} from "../db/dbClient.js"
import type { CreateUserRequestDto, User } from "../dtos/user.dto.js";

export class UserRepository {
    async getAll(): Promise<User[]> {
        const sql = "SELECT * FROM Users;";
        return await all<User>(sql);
    }
    async getById(id: string | number): Promise<User | undefined> {
        const sql = `SELECT * FROM Users WHERE id = ${Number(id)};`;    
        return await get<User>(sql);
    }
    async create(data: CreateUserRequestDto): Promise<User> {
        const now = new Date().toISOString();
        const sql = `
        INSERT INTO Users (email, name, role, createdAt)
        VALUES ('${data.email}', '${data.username}', '${data.role}', '${now}');
        `
        const result = await run(sql);
        const newUser = await this.getById(result.lastID)
        return newUser!
    }
    async update(id: string | number, data: any): Promise<User | null> {
        const sql = `UPDATE Users SET name = '${data.username}' WHERE id = ${Number(id)}`;
        await run(sql);
        return (await this.getById(id)) || null;
    }
    async delete(id: string |  number): Promise<boolean> {
        const result = await run(`DELETE FROM Users WHERE id = ${Number(id)}`)
        return result.changes > 0;
    }
}