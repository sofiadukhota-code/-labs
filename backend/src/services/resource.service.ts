import { ResourceRepository } from "../repositories/resource.repository.js";
import type { 
    ResourceResponseDto, 
    ResourceQueryDto, 
    CreateResourceRequestDto, 
    UpdateResourceRequestDto,
    Resource
} from "../dtos/resource.dto.js";
import crypto from "node:crypto";

export const ResourceService = {
    mapToResponse: (resource: Resource): ResourceResponseDto => ({
        id: resource.id,
        title: resource.title,
        link: resource.link,
        type: resource.type,
        author: resource.author,
        createdAt: resource.createdAt
    }),
    getAllResources: (query: ResourceQueryDto): ResourceResponseDto[] => {
        let list = ResourceRepository.getAll();

        // 5.1 Фільтрація
        if (query.type) {
            list = list.filter(r => r.type === query.type);
        }
        if (query.author) {
            list = list.filter(r => r.author.toLowerCase().includes(query.author!.toLowerCase()));
        }

        // 5.3 Сортування
        if (query.sortBy) {
            const field = query.sortBy as keyof ResourceResponseDto;
            const dir = query.sortDir === 'desc' ? -1 : 1;

            list.sort((a, b) => {
                if (a[field] < b[field]) return -1 * dir;
                if (a[field] > b[field]) return 1 * dir;
                return 0;
            });
        }

        return list.map(ResourceService.mapToResponse);
    },
    createResource: (dto: CreateResourceRequestDto): Resource => {
        if (!dto.title || !dto.link || !dto.type || !dto.author) {
            const err = new Error("fields title, link, type, author are required") as any;
            err.status = 400;
            err.code = "Validation error";
            throw err;
        }
        if (dto.title.trim().length < 3) {
            const err = new Error("Title is too short") as any;
            err.status = 400;
            err.code = "Validation error";
            throw err;
        }
        if (dto.author.trim().length < 2) {
            const err = new Error("Author`s name is too short") as any;
            err.status = 400;
            err.code = "Validation error";
            throw err;
        }
        const allowedTypes = ["website", "book", "article", "video"];
        if (!allowedTypes.includes(dto.type)) {
            const err = new Error(`Unavaliable type. Allowed: ${allowedTypes.join(", ")}`) as any;
            err.status = 400;
            err.code = "Validation error";
            throw err;
        }
        const newResource: Resource = {
            id: crypto.randomUUID(),
            ...dto,
            createdAt: new Date().toISOString()
        }
        return ResourceRepository.add(newResource);
    },
    getResourceById: (id: string) => {
        return ResourceRepository.getById(id);
    },
    updateResource: (id: string, dto: CreateResourceRequestDto) => {
        return ResourceRepository.update(id, dto);
    },
    deleteResource: (id: string): boolean => {
        return ResourceRepository.delete(id);
    }
}
