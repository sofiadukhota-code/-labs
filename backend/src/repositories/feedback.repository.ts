import { type Feedback } from "../dtos/feedback.dto.js";

const feedbacks: Feedback[] = [];

export const FeedbackRepository = {
    add: (f: Feedback) => {
        feedbacks.push(f);
        return f;
    },
    getByResource: (resourceId: string) => {
        return feedbacks.filter(f => f.resourceId === resourceId);
    },
    getAll: () => feedbacks
};