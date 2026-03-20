export interface Feedback {
    id: string
    resourceId: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface CreateFeedbackDto {
    resourceId: string;
    userId: string;
    rating: number;
    comment: string;
}