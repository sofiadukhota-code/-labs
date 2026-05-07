import { FeedbackRepository } from "../repositories/feedback.repository.js";
import type {
    Feedback,
    CreateFeedbackDto,
    UpdateFeedbackDto,
} from "../dtos/feedback.dto.js";

const repo = new FeedbackRepository();

function validationError(message: string): never {
    const err = new Error(message) as any;
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    throw err;
}

export const FeedbackService = {
    create: async (dto: CreateFeedbackDto): Promise<Feedback> => {
        if (!Number.isFinite(Number(dto.resourceId)) || Number(dto.resourceId) <= 0) {
            validationError("resourceId is required");
        }

        if (!Number.isFinite(Number(dto.userId)) || Number(dto.userId) <= 0) {
            validationError("userId is required");
        }

        if (!Number.isFinite(Number(dto.rating)) || dto.rating < 1 || dto.rating > 5) {
            validationError("Rating must be between 1 and 5");
        }

        if (!dto.comment || dto.comment.trim().length < 5) {
            validationError("Comment must be at least 5 characters long");
        }

        return await repo.create(dto);
    },

    getAll: async (): Promise<Feedback[]> => {
        return await repo.getAll();
    },

    getById: async (id: string | number): Promise<Feedback | undefined> => {
        return await repo.getById(id);
    },

    getByResource: async (resourceId: string | number): Promise<Feedback[]> => {
        return await repo.getByResource(resourceId);
    },

    update: async (id: string | number, dto: UpdateFeedbackDto): Promise<Feedback | null> => {
        if (dto.rating !== undefined) {
            if (!Number.isFinite(Number(dto.rating)) || dto.rating < 1 || dto.rating > 5) {
                validationError("Rating must be between 1 and 5");
            }
        }

        if (dto.comment !== undefined && dto.comment.trim().length < 5) {
            validationError("Comment must be at least 5 characters long");
        }

        return await repo.update(id, dto);
    },

    delete: async (id: string | number): Promise<boolean> => {
        return await repo.delete(id);
    },
};