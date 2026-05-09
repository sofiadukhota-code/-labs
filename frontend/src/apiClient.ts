import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "./config";
import type { ApiError, Resource, User, Feedback, CreateResourceDto, CreateUserDto, CreateFeedbackDto } from "./dtos";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 30_000; // кеш живе 30 секунд
const cacheStore = new Map<string, CacheEntry<unknown>>();

const cache = {
  get<T>(key: string): T | null {
    const entry = cacheStore.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      cacheStore.delete(key);
      return null;
    }
    console.log("[cache hit]", key);
    return entry.data;
  },

  set<T>(key: string, data: T): void {
    cacheStore.set(key, { data, timestamp: Date.now() });
  },

  invalidate(prefix: string): void {
    for (const key of cacheStore.keys()) {
      if (key.startsWith(prefix)) {
        cacheStore.delete(key);
        console.log("[cache invalidated]", key);
      }
    }
  },
};

function friendlyMessage(status: number, payload: any): string {
  if (status === 409) return "Такий email вже існує";
  if (status === 404) return "Запис не знайдено";
  if (status === 400) return "Некоректні дані — перевірте заповнені поля";
  if (status === 429) return "Забагато запитів — спробуйте пізніше";
  if (status === 503) return "Сервер тимчасово недоступний";
  if (status === 500) return "Помилка сервера — спробуйте пізніше";
  return payload?.error?.message ?? payload?.message ?? `HTTP помилка ${status}`;
}

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;

function isRetryable(method: string, status: number): boolean {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  const retryableStatuses = [429, 503];
  return safeMethods.includes(method.toUpperCase()) && retryableStatuses.includes(status);
}

function getRetryDelay(response: Response, attempt: number): number {
  const retryAfterHeader = response.headers.get("Retry-After");
  if (retryAfterHeader) {
    const seconds = Number(retryAfterHeader);
    if (!isNaN(seconds)) return seconds * 1000;
  }
  // експоненційна затримка: 1с, 2с, 3с
  return BASE_RETRY_DELAY_MS * attempt;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  attempt = 1
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const method = (options.method ?? "GET").toUpperCase();

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

  // retry 429/503 
  if (isRetryable(method, response.status) && attempt <= MAX_RETRIES) {
    const delay = getRetryDelay(response, attempt);
    console.warn(
      `[retry] статус ${response.status} — спроба ${attempt}/${MAX_RETRIES} через ${delay}мс`
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
    return request<T>(path, options, attempt + 1);
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
    message: friendlyMessage(response.status, payload),
    details: rawText,
  };
  throw err;
}

export const resourcesApi = {
  getAll: (params?: {
    type?: string;
    author?: string;
    sortBy?: string;
    sortDir?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set("type", params.type);
    if (params?.author) q.set("author", params.author);
    if (params?.sortBy) q.set("sortBy", params.sortBy);
    if (params?.sortDir) q.set("sortDir", params.sortDir);
    const qs = q.toString() ? `?${q.toString()}` : "";
    const path = `/resources${qs}`;

    const cacheKey = `resources:list:${qs}`;
    const cached = cache.get<Resource[]>(cacheKey);
    if (cached) return Promise.resolve(cached);

    return request<Resource[]>(path).then((data) => {
      cache.set(cacheKey, data);
      return data;
    });
  },

  getById: (id: number) => {
    const cacheKey = `resources:item:${id}`;
    const cached = cache.get<Resource>(cacheKey);
    if (cached) return Promise.resolve(cached);

    return request<Resource>(`/resources/${id}`).then((data) => {
      cache.set(cacheKey, data);
      return data;
    });
  },

  topLiked: () => {
    const cacheKey = "resources:top-liked";
    const cached = cache.get<{ id: number; title: string; likesCount: number; avgRating: number }[]>(cacheKey);
    if (cached) return Promise.resolve(cached);

    return request<{ id: number; title: string; likesCount: number; avgRating: number }[]>(
      "/resources/top-liked"
    ).then((data) => {
      cache.set(cacheKey, data);
      return data;
    });
  },

  create: (dto: CreateResourceDto) =>
    request<Resource>("/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    }).then((data) => {
      cache.invalidate("resources:");
      return data;
    }),

  update: (id: number, dto: Partial<CreateResourceDto>) =>
    request<Resource>(`/resources/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    }).then((data) => {
      cache.invalidate("resources:");
      return data;
    }),

  remove: (id: number) =>
    request<null>(`/resources/${id}`, { method: "DELETE" }).then((data) => {
      cache.invalidate("resources:");
      return data;
    }),
};

export const usersApi = {
  getAll: () => {
    const cacheKey = "users:list";
    const cached = cache.get<User[]>(cacheKey);
    if (cached) return Promise.resolve(cached);

    return request<User[]>("/users").then((data) => {
      cache.set(cacheKey, data);
      return data;
    });
  },

  create: (dto: CreateUserDto) =>
    request<User>("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    }).then((data) => {
      cache.invalidate("users:");
      return data;
    }),
};

export const feedbackApi = {
  getByResource: (resourceId: number) => {
    const cacheKey = `feedbacks:resource:${resourceId}`;
    const cached = cache.get<Feedback[]>(cacheKey);
    if (cached) return Promise.resolve(cached);

    return request<Feedback[]>(`/feedbacks/resource/${resourceId}`).then((data) => {
      cache.set(cacheKey, data);
      return data;
    });
  },

  create: (dto: CreateFeedbackDto) =>
    request<Feedback>("/feedbacks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    }).then((data) => {
      cache.invalidate(`feedbacks:resource:${dto.resourceId}`);
      cache.invalidate("resources:top-liked");
      return data;
    }),

  remove: (id: number, resourceId: number) =>
    request<null>(`/feedbacks/${id}`, { method: "DELETE" }).then((data) => {
      cache.invalidate(`feedbacks:resource:${resourceId}`);
      cache.invalidate("resources:top-liked");
      return data;
    }),
};