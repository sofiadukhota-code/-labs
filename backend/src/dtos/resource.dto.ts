export interface Resource {
    id: string;
    title: string;
    link: string;
    type: 'book' | 'website' | 'video' | 'research' | 'Authors';
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
    title: string;
    link: string;
    type: 'book' | 'website' | 'video' | 'research' | 'Authors';
    author: string;
    description: string;
}

export interface UpdateResourceRequestDto {
    title?: string;
    link?: string;
    type?: 'book' | 'website' | 'video' | 'research' | 'Authors';
    author?: string;
    description?: string;
}

export class ResourceQueryDto {
    type?: string;
    author?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}