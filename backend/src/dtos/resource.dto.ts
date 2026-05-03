export const RESOURCE_TYPES = ["book", "website", "article", "video"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export interface Resource {
    id: string;
    userId: number;
    title: string;
    link: string;
    type: ResourceType;
    description: string;
    author: string;
    createdAt: string;
}

export interface ResourceResponseDto {
    id: string;
    title: string;
    link: string;
    type: string;
    author: string;
    createdAt: string;
}

export interface CreateResourceRequestDto {
    userId: number;
    title: string;
    link: string;
    type: ResourceType;
    author: string;
    description: string;
}

export interface UpdateResourceRequestDto {
    title?: string;
    link?: string;
    type?: ResourceType;
    author?: string;
    description?: string;
}

export class ResourceQueryDto {
    type?: ResourceType;
    author?: string;
    sortBy?: "createdAt" | "title";
    sortDir?: 'asc' | 'desc';
}