import { type Feedback } from "../dtos/feedback.dto.js";

const feedbacks: Feedback[] = [];

export const FeedbackRepository = {
    add: (f: Feedback) => {
        feedbacks.push(f);
        return f;
    },
    getById: (id: string) => feedbacks.find(f => f.id === id) ?? null,

    update: (id: string, dto: any) => {
        const index = feedbacks.findIndex(f => f.id === id);
        if (index === -1) return null;
        feedbacks[index] = { ...feedbacks[index], ...dto } as Feedback;
        return feedbacks[index];
    },

    delete: (id: string) => {
        const index = feedbacks.findIndex(f => f.id === id);
        if (index === -1) return false;
        feedbacks.splice(index, 1);
        return true;
    },
    getByResource: (resourceId: string) => {
        return feedbacks.filter(f => f.resourceId === resourceId);
    },
    getAll: () => feedbacks
};