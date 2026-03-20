import type { Request, Response, NextFunction } from "express";
import { FeedbackService } from "../services/feedback.service.js";
import type { CreateFeedbackDto } from "../dtos/feedback.dto.js";

export const FeedbackController = {
    create: (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto: CreateFeedbackDto = req.body;
            const newFeedback = FeedbackService.addFeedback(dto);
            res.status(201).json(newFeedback);
        } catch (error) {
            next(error);
        }
    },
    getByResource: (req: Request, res: Response, next: NextFunction) => {
        try {
            const resourceId = req.params.resourceId as string;
            const feedbacks = FeedbackService.getFeedbacksByResource(resourceId);
            res.status(200).json(feedbacks);
        } catch (error) {
            next(error);
        }
    },
    getById: (req: Request, res: Response) => {
        const feedback = FeedbackService.getFeedbackById(req.params.id as string);
        feedback ? res.json(feedback) : res.status(404).json({ error: "Feedback not found" });
    },
    update: (req: Request, res: Response, next: NextFunction) => {
        try {
            const updated = FeedbackService.updateFeedback(req.params.id as string, req.body);
            updated ? res.json(updated) : res.status(404).json({ error: "Feedback not found" });
        } catch (e) { next(e); }
    },
    delete: (req: Request, res: Response) => {
        const success = FeedbackService.deleteFeedback(req.params.id as string);
        success ? res.status(204).send() : res.status(404).json({ error: "Feedback not found" });
    }
};