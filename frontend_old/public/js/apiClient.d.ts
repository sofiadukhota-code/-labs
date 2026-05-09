import type { Resource, User, Feedback, CreateResourceDto, CreateUserDto, CreateFeedbackDto } from "./dtos";
export declare const resourcesApi: {
    getAll: (params?: {
        type?: string;
        author?: string;
        sortBy?: string;
        sortDir?: string;
    }) => Promise<Resource[]>;
    getById: (id: number) => Promise<Resource>;
    create: (dto: CreateResourceDto) => Promise<Resource>;
    update: (id: number, dto: Partial<CreateResourceDto>) => Promise<Resource>;
    remove: (id: number) => Promise<null>;
    topLiked: () => Promise<{
        id: number;
        title: string;
        likesCount: number;
        avgRating: number;
    }[]>;
};
export declare const usersApi: {
    getAll: () => Promise<User[]>;
    create: (dto: CreateUserDto) => Promise<User>;
};
export declare const feedbackApi: {
    getByResource: (resourceId: number) => Promise<Feedback[]>;
    create: (dto: CreateFeedbackDto) => Promise<Feedback>;
    remove: (id: number) => Promise<null>;
};
//# sourceMappingURL=apiClient.d.ts.map