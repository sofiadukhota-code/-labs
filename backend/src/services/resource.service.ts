import { ResourceRepository } from "../repositories/resource.repository.js";
import { FeedbackRepository } from "../repositories/feedback.repository.js";
import type {
  ResourceResponseDto,
  ResourceQueryDto,
  CreateResourceRequestDto,
  UpdateResourceRequestDto,
  Resource,
} from "../dtos/resource.dto.js";
import { RESOURCE_TYPES} from "../dtos/resource.dto.js";
import crypto from "node:crypto";

const repo = new ResourceRepository();

const AllowedSortBy = ["createdAt", "title"] as const;
const AllowedSortDir = ["asc", "desc"] as const;

function validationError(message: string): never {
  const err = new Error(message) as any;
  err.status = 400;
  err.code = "Validation error";
  throw err;
}
export const ResourceService = {
  mapToResponse: (resource: Resource): ResourceResponseDto => ({
    id: resource.id,
    title: resource.title,
    link: resource.link,
    type: resource.type,
    author: resource.author,
    createdAt: resource.createdAt,
  }),
  getAllResources: async (query: ResourceQueryDto): Promise<ResourceResponseDto[]> => {
    if(query.sortBy && !AllowedSortBy.includes(query.sortBy as any)) {
      validationError(`invalid sortBy. Allowed: ${AllowedSortBy.join(", ")}`)
    }
    if(query.sortDir && !AllowedSortDir.includes(query.sortDir as any)) {
      validationError(`invalid SortDir. Allowed: ${AllowedSortDir.join(", ")}`)
    }
    const list: Resource[] = await repo.getAllFiltered(query);
    return list.map(ResourceService.mapToResponse)
  },
  createResource: async (dto: CreateResourceRequestDto, userId: number): Promise<Resource> => {
    if (!dto.title || !dto.link || !dto.type || !dto.author) {
      validationError("fields title, link, type, author are required");
    }
    if(!Number.isFinite(userId) || userId <= 0) {
      validationError("userId is required")
    }
    if (dto.title.trim().length < 3) {
      validationError("Title is too short");
    }
    if (dto.author.trim().length < 2) {
      validationError("Author`s name is too short");
    }
    if (!RESOURCE_TYPES.includes(dto.type)) {
      validationError( `Unavaliable type. Allowed: ${RESOURCE_TYPES.join(", ")}`)
    }
    return await repo.add({ ...dto, userId });
  },
  getResourceById: async (id: string | number,): Promise<Resource | undefined> => {
    return await repo.getById(id);
  },
  updateResource: async ( id: string | number, dto: Partial<Resource>,): Promise<Resource | null> => {
    return await repo.update(id, dto);
  },
  deleteResource: async (id: string | number): Promise<boolean> => {
    return await repo.delete(id);
  },
  getTopLikedResource: async () => {
    return await repo.getTopLikedResource;
}
}
