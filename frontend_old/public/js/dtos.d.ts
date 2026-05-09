export interface Resource {
    id: number;
    userId: number;
    title: string;
    description: string | null;
    link: string;
    type: string;
    author: string;
    createdAt: string;
}
export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    createdAt: string;
}
export interface Feedback {
    id: number;
    resourceId: number;
    userId: number;
    rating: number;
    comment: string;
    createdAt: string;
}
export interface CreateResourceDto {
    userId: number;
    title: string;
    link: string;
    type: string;
    author: string;
    description?: string;
}
export interface CreateUserDto {
    name: string;
    email: string;
    role: string;
}
export interface CreateFeedbackDto {
    resourceId: number;
    userId: number;
    rating: number;
    comment: string;
}
export interface ApiError {
    status: number;
    message: string;
    details?: string;
}
//# sourceMappingURL=dtos.d.ts.map