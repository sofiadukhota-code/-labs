import { UserRepository } from "../repositories/user.repository.js";
import { type User, type CreateUserRequestDto } from "../dtos/user.dto.js";
import crypto from "node:crypto";
import type { CreateFeedbackDto } from "../dtos/feedback.dto.js";

export const UserService = {
    createUser: (dto: CreateUserRequestDto): User => {
        if(!dto.username || !dto.email || !dto.role) {
            const err = new Error("Username, email and role are required") as any;
            err.status = 400;
            err.code = "Validation error";
            throw err;
        }
        if(dto.username.length < 3) {
            const err = new Error("Username must be at least 3 characters") as any;
            err.status = 400;
            err.code = "Validation error";
            throw err;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(dto.email)) {
            const err = new Error("Invalid email format") as any;
            err.status = 400;
            err.code = "Validation error";
            throw err;
        }
        const newUser: User = {
            id: crypto.randomUUID(),
            ...dto,
            createdAt: new Date().toISOString()
        }
        return UserRepository.add(newUser);
    },
    getAllUsers: () => UserRepository.getAll(),
    getUserById: (id: string) => UserRepository.getById(id),
    updateUser: (id: string, dto: CreateUserRequestDto) : User | null => {
        return UserRepository.update(id, dto);
    },
    deleteUser: (id: string) => UserRepository.delete(id)
}