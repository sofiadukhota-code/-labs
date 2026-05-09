import type { Resource, User, Feedback, ApiError } from "./dtos";
export declare function showNotice(text: string, isError?: boolean): void;
export declare function showApiError(err: ApiError): void;
export declare function showStatus(containerId: string, status: "loading" | "empty" | "error" | "success", err?: ApiError): void;
export declare function renderResources(resources: Resource[], onEdit: (r: Resource) => void, onDelete: (id: number) => void): void;
export declare function renderUsersDropdown(users: User[]): void;
export declare function renderResourcesDropdown(resources: Resource[]): void;
export declare function renderFeedbacks(feedbacks: Feedback[], onDelete: (id: number) => void): void;
export declare function renderTopLiked(items: {
    id: number;
    title: string;
    likesCount: number;
    avgRating: number;
}[]): void;
export declare function setButtonLoading(btn: HTMLButtonElement, loading: boolean, label: string): void;
export declare function fillResourceForm(r: Resource): void;
export declare function clearResourceForm(): void;
//# sourceMappingURL=ui.d.ts.map