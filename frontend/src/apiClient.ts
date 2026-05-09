import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "./config";
import type { ApiError, Resource, User, Feedback, CreateResourceDto, CreateUserDto, CreateFeedbackDto } from "./dtos";

function userMessage(status: number, payload: any): string {
  if (status === 409) return "Такий email вже існує";
  if (status === 404) return "Запис не знайдено";
  if (status === 400) return "Некоректні дані — перевірте заповнені поля";
  if (status === 500) return "Помилка сервера — спробуйте пізніше";
  return payload?.error?.message ?? payload?.message ?? `HTTP помилка ${status}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(url, { ...options, signal: controller.signal });
  } catch (e: unknown) {
    const err: ApiError = {
      status: 0,
      message:
        e instanceof DOMException && e.name === "AbortError"
          ? "Перевищено час очікування запиту"
          : "Помилка мережі або CORS — перевір що бекенд запущений",
      details: e instanceof Error ? e.message : String(e),
    };
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  const rawText = await response.text();

  if (response.ok) {
    if (!rawText) return null as unknown as T;
    try {
      return JSON.parse(rawText) as T;
    } catch {
      return rawText as unknown as T;
    }
  }

  let payload: { message?: string; error?: { message?: string } } | null = null;
  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    // rawText
  }

  const err: ApiError = {
    status: response.status,
    message:
      userMessage(response.status, payload),
    details: rawText,
  };
  throw err;
}

export const resourcesApi = {
  getAll: (params?: { type?: string; author?: string; sortBy?: string; sortDir?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set("type", params.type);
    if (params?.author) q.set("author", params.author);
    if (params?.sortBy) q.set("sortBy", params.sortBy);
    if (params?.sortDir) q.set("sortDir", params.sortDir);
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<Resource[]>(`/resources${qs}`);
  },
  getById: (id: number) => request<Resource>(`/resources/${id}`),
  create: (dto: CreateResourceDto) =>
    request<Resource>("/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    }),
  update: (id: number, dto: Partial<CreateResourceDto>) =>
    request<Resource>(`/resources/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    }),
  remove: (id: number) => request<null>(`/resources/${id}`, { method: "DELETE" }),
  topLiked: () => request<{ id: number; title: string; likesCount: number; avgRating: number }[]>("/resources/top-liked"),
};

export const usersApi = {
  getAll: () => request<User[]>("/users"),
  create: (dto: CreateUserDto) =>
    request<User>("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    }),
};

export const feedbackApi = {
  getByResource: (resourceId: number) =>
    request<Feedback[]>(`/feedbacks/resource/${resourceId}`),
  create: (dto: CreateFeedbackDto) =>
    request<Feedback>("/feedbacks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    }),
  remove: (id: number) => request<null>(`/feedbacks/${id}`, { method: "DELETE" }),
};