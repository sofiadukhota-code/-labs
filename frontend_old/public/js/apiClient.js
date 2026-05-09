import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "./config";
async function request(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response;
    try {
        response = await fetch(url, { ...options, signal: controller.signal });
    }
    catch (e) {
        const err = {
            status: 0,
            message: e instanceof DOMException && e.name === "AbortError"
                ? "Перевищено час очікування запиту"
                : "Помилка мережі або CORS — перевірте що бекенд запущений",
            details: e instanceof Error ? e.message : String(e),
        };
        throw err;
    }
    finally {
        clearTimeout(timeoutId);
    }
    if (response.status === 204) {
        return null;
    }
    const rawText = await response.text();
    if (response.ok) {
        if (!rawText)
            return null;
        try {
            return JSON.parse(rawText);
        }
        catch {
            return rawText;
        }
    }
    let payload = null;
    try {
        payload = rawText ? JSON.parse(rawText) : null;
    }
    catch {
        // rawText
    }
    const err = {
        status: response.status,
        message: payload?.error?.message ??
            payload?.message ??
            `HTTP помилка ${response.status}`,
        details: rawText,
    };
    throw err;
}
export const resourcesApi = {
    getAll: (params) => {
        const q = new URLSearchParams();
        if (params?.type)
            q.set("type", params.type);
        if (params?.author)
            q.set("author", params.author);
        if (params?.sortBy)
            q.set("sortBy", params.sortBy);
        if (params?.sortDir)
            q.set("sortDir", params.sortDir);
        const qs = q.toString() ? `?${q.toString()}` : "";
        return request(`/resources${qs}`);
    },
    getById: (id) => request(`/resources/${id}`),
    create: (dto) => request("/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    }),
    update: (id, dto) => request(`/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    }),
    remove: (id) => request(`/resources/${id}`, { method: "DELETE" }),
    topLiked: () => request("/resources/top-liked"),
};
export const usersApi = {
    getAll: () => request("/users"),
    create: (dto) => request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    }),
};
export const feedbackApi = {
    getByResource: (resourceId) => request(`/feedbacks/resource/${resourceId}`),
    create: (dto) => request("/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    }),
    remove: (id) => request(`/feedbacks/${id}`, { method: "DELETE" }),
};
//# sourceMappingURL=apiClient.js.map