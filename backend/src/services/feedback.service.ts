import { FeedbackRepository } from "../repositories/feedback.repository.js";
import { type Feedback, type CreateFeedbackDto } from "../dtos/feedback.dto.js";
import crypto from "node:crypto";

export const FeedbackService = {
    addFeedback: (dto: CreateFeedbackDto): Feedback => {
        if (dto.rating < 1 || dto.rating > 5) {
            const err = new Error("Оцінка має бути від 1 до 5") as any;
            err.status = 400;
            err.code = "VALIDATIONERROR"
            throw err;
        }
        if (dto.comment.trim().length < 5) {
            const err = new Error("Відгук занадто короткий (мін. 5 символів)") as any;
            err.status = 400;
            throw err;
        }

        const newFeedback: Feedback = {
            id: crypto.randomUUID(),
            ...dto,
            createdAt: new Date().toISOString()
        };

        return FeedbackRepository.add(newFeedback);
    },

    getFeedbacksByResource: (resourceId: string) => {
        return FeedbackRepository.getByResource(resourceId);
    },
    getFeedbackById: (id: string) => FeedbackRepository.getById(id),

    updateFeedback: (id: string, dto: any) => {
        if (dto.rating && (dto.rating < 1 || dto.rating > 5)) {
            throw new Error("Оцінка має бути від 1 до 5");
        }
        return FeedbackRepository.update(id, dto);
    },

    deleteFeedback: (id: string) => FeedbackRepository.delete(id)
};
