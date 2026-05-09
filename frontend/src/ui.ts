import type { Resource, User, Feedback, ApiError } from "./dtos";

let noticeTimer: ReturnType<typeof setTimeout> | null = null;

export function showNotice(text: string, isError = false): void {
  const el = document.getElementById("notice")!;
  el.textContent = text;
  el.className = isError ? "notice error" : "notice success";
  if (noticeTimer) clearTimeout(noticeTimer);
  if(!isError) {
  noticeTimer = setTimeout(() => {
    el.textContent = "";
    el.className = "notice";
  }, 4000);
}
}

export function showApiError(err: ApiError): void {
  showNotice(`Помилка (${err.status}): ${err.message}`, true);
}

export function showStatus(containerId: string, status: "loading" | "empty" | "error" | "success", err?: ApiError): void {
  const el = document.getElementById(containerId)!;
  if (status === "loading") el.textContent = "Завантаження...";
  else if (status === "empty") el.textContent = "Записів немає.";
  else if (status === "error") el.textContent = `Помилка: ${err?.message ?? "невідома"}`;
  else el.textContent = "";
}

export function renderResources(resources: Resource[], onEdit: (r: Resource) => void, onDelete: (id: number) => void): void {
  const tbody = document.getElementById("resourcesTableBody")!;
  if (resources.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">Немає даних</td></tr>';
    return;
  }
  tbody.innerHTML = resources.map((r) => `
    <tr>
      <td>${r.title ?? "—"}</td>
      <td>${r.type ?? "—"}</td>
      <td>${r.author ?? "—"}</td>
      <td><a href="${r.link}" target="_blank">Посилання</a></td>
      <td>
        <button class="btn-edit" data-id="${r.id}">Редагувати</button>
        <button class="btn-delete" data-id="${r.id}">Видалити</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll<HTMLButtonElement>(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const resource = resources.find((r) => r.id === id);
      if (resource) onEdit(resource);
    });
  });

  tbody.querySelectorAll<HTMLButtonElement>(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("Видалити ресурс?")) onDelete(Number(btn.dataset.id));
    });
  });
}

export function renderUsersDropdown(users: User[]): void {
  const selects = document.querySelectorAll<HTMLSelectElement>(".user-select");
  selects.forEach((sel) => {
    const current = sel.value;
    sel.innerHTML =
      '<option value="">Оберіть користувача</option>' +
      users.map((u) => `<option value="${u.id}">${u.name} (${u.email})</option>`).join("");
    sel.value = current;
  });
}

export function renderResourcesDropdown(resources: Resource[]): void {
  const sel = document.getElementById("feedbackResource") as HTMLSelectElement;
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML =
    '<option value="">Оберіть ресурс</option>' +
    resources.map((r) => `<option value="${r.id}">${r.title}</option>`).join("");
  sel.value = current;
}

export function renderFeedbacks(feedbacks: Feedback[], onDelete: (id: number) => void): void {
  const el = document.getElementById("feedbackList")!;
  if (feedbacks.length === 0) {
    el.innerHTML = "<p>Відгуків немає.</p>";
    return;
  }
  el.innerHTML = feedbacks.map((f) => `
    <div class="feedback-card">
      <span>⭐ ${f.rating}/5</span>
      <p>${f.comment ?? "—"}</p>
      <button class="btn-delete-feedback" data-id="${f.id}">Видалити</button>
    </div>
  `).join("");

  el.querySelectorAll<HTMLButtonElement>(".btn-delete-feedback").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("Видалити відгук?")) onDelete(Number(btn.dataset.id));
    });
  });
}

export function renderTopLiked(items: { id: number; title: string; likesCount: number; avgRating: number }[]): void {
  const el = document.getElementById("topLikedList")!;
  if (!items || items.length === 0) {
    el.innerHTML = "<p>Немає даних.</p>";
    return;
  }
  el.innerHTML = items.map((item, i) => `
    <div class="top-card">
      <strong>${i + 1}. ${item.title ?? "—"}</strong>
      <span>Відгуків: ${item.likesCount} | Рейтинг: ${Number(item.avgRating).toFixed(1)}</span>
    </div>
  `).join("");
}

export function setButtonLoading(btn: HTMLButtonElement, loading: boolean, label: string): void {
  btn.disabled = loading;
  btn.textContent = loading ? "Зачекайте..." : label;
}

export function fillResourceForm(r: Resource): void {
  (document.getElementById("resTitle") as HTMLInputElement).value = r.title;
  (document.getElementById("resLink") as HTMLInputElement).value = r.link;
  (document.getElementById("resType") as HTMLSelectElement).value = r.type;
  (document.getElementById("resAuthor") as HTMLInputElement).value = r.author;
  (document.getElementById("resDescription") as HTMLTextAreaElement).value = r.description ?? "";
}

export function clearResourceForm(): void {
  (document.getElementById("resourceForm") as HTMLFormElement).reset();
}