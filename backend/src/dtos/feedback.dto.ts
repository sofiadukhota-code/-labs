export interface Feedback {
    id: number;
    resourceId: number;
    userId: number;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface CreateFeedbackDto {
    resourceId: number;
    userId: number;
    rating: number;
    comment: string;
}

export interface UpdateFeedbackDto {
    resourceId?: number;
    userId?: number;
    rating?: number;
    comment?: string;
}

export interface FeedbackResponseDto {
    id: number;
    resourceId: number;
    userId: number;
    rating: number;
    comment: string;
    createdAt: string;
}