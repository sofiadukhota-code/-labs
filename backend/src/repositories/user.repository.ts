import type { User } from "../dtos/user.dto.js";

const users: User[] = [];

export const UserRepository = {
    getAll: () => users,
    getById: (id: string) => users.find(u => u.id === id),
    add: (user: User) => {
        users.push(user);
        return user;
    },
    update: (id: string, dto: any): User | null => {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;

        users[index] = {
            ...users[index],
            ...dto
        };
        return users[index] ?? null;
    },
    delete: (id: string) => {
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users.splice(index, 1);
            return true;
        }
        return false;
    }
}