import { UserRepository } from "../repositories/user.repository.js";
import {
    type User,
    type CreateUserRequestDto,
    type UpdateUserRequestDto
} from "../dtos/user.dto.js";
const repo = new UserRepository();
function validationError(message: string): never {
    const err = new Error(message) as any;
    err.status = 400;
    err.code = "Validation error";
    throw err;
}
function validateCreateUserDto(dto: CreateUserRequestDto): void {
    if (!dto.name || !dto.email || !dto.role) {
        validationError("Name, email and role are required");
    }
    if (dto.name.trim().length < 3) {
        validationError("Name must be at least 3 characters");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
        validationError("Invalid email format");
    }
}
export const UserService = {
    createUser: async (dto: CreateUserRequestDto): Promise<User> => {
        validateCreateUserDto(dto);
        return repo.create(dto);
    },
    getAllUsers: async (): Promise<User[]> => {
        return repo.getAll();
    },
    getUserById: async (id: string): Promise<User | undefined> => {
        return repo.getById(id);
    },
    updateUser: async (id: string, dto: UpdateUserRequestDto): Promise<User | null> => {
        return repo.update(id, dto);
    },
    deleteUser: async (id: string): Promise<boolean> => {
        return repo.delete(id);
    }
};