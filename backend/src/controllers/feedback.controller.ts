import type { Request, Response, NextFunction } from "express";
import { FeedbackService } from "../services/feedback.service.js";
import type {
    CreateFeedbackDto,
    UpdateFeedbackDto,
} from "../dtos/feedback.dto.js";

function getRouteParam(value: unknown, name: string): string {
    if (typeof value !== "string" || value.trim() === "") {
        const err = new Error(`${name} is required`) as Error & {
            status?: number;
            code?: string;
        };
        err.status = 400;
        err.code = "VALIDATION_ERROR";
        throw err;
    }

    return value;
}

export const FeedbackController = {
    getAll: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const items = await FeedbackService.getAll();
            res.status(200).json(items);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = getRouteParam(req.params.id, "id");
            const feedback = await FeedbackService.getById(id);

            if (!feedback) {
                res.status(404).json({
                    error: {
                        code: "NOT_FOUND",
                        message: "Feedback not found",
                    },
                });
                return;
            }

            res.status(200).json(feedback);
        } catch (error) {
            next(error);
        }
    },

    getByResource: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const resourceId = getRouteParam(req.params.resourceId, "resourceId");
            const feedbacks = await FeedbackService.getByResource(resourceId);
            res.status(200).json(feedbacks);
        } catch (error) {
            next(error);
        }
    },

    create: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto: CreateFeedbackDto = req.body;
            const created = await FeedbackService.create(dto);
            res.status(201).json(created);
        } catch (error) {
            next(error);
        }
    },

    update: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = getRouteParam(req.params.id, "id");
            const dto: UpdateFeedbackDto = req.body;
            const updated = await FeedbackService.update(id, dto);

            if (!updated) {
                res.status(404).json({
                    error: {
                        code: "NOT_FOUND",
                        message: "Feedback not found",
                    },
                });
                return;
            }

            res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    },

    delete: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = getRouteParam(req.params.id, "id");
            const deleted = await FeedbackService.delete(id);

            if (!deleted) {
                res.status(404).json({
                    error: {
                        code: "NOT_FOUND",
                        message: "Feedback not found",
                    },
                });
                return;
            }

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },
};