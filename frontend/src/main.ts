import './styles.css';
import { resourcesApi, usersApi, feedbackApi } from "./apiClient";
import {
  showNotice, showApiError, showStatus,
  renderResources, renderUsersDropdown, renderResourcesDropdown,
  renderFeedbacks, renderTopLiked,
  setButtonLoading, fillResourceForm, clearResourceForm,
} from "./ui";
import type { ApiError, Resource } from "./dtos";

let allResources: Resource[] = [];
let editingId: number | null = null;
let currentFeedbackResourceId: number | null = null;

async function loadResources(): Promise<void> {
  showStatus("resourcesStatus", "loading");
  try {
    const type = (document.getElementById("filterType") as HTMLSelectElement).value;
    const sortBy = (document.getElementById("sortBy") as HTMLSelectElement).value;
    const sortDir = (document.getElementById("sortDir") as HTMLSelectElement).value;

    const params = {
      ...(type ? { type } : {}),
      sortBy,
      sortDir,
    };

    const data = await resourcesApi.getAll(params);
    allResources = data ?? [];

    if (allResources.length === 0) {
      showStatus("resourcesStatus", "empty");
      renderResources([], onEdit, onDelete);
    } else {
      showStatus("resourcesStatus", "success");
      renderResources(allResources, onEdit, onDelete);
    }

    renderResourcesDropdown(allResources);
  } catch (e) {
    showStatus("resourcesStatus", "error", e as ApiError);
    showApiError(e as ApiError);
  }
}

function onEdit(resource: Resource): void {
  editingId = resource.id;
  fillResourceForm(resource);
  (document.getElementById("submitResourceBtn") as HTMLButtonElement).textContent = "Зберегти зміни";
  document.getElementById("resourceForm")?.scrollIntoView({ behavior: "smooth" });
}

async function onDelete(id: number): Promise<void> {
  try {
    await resourcesApi.remove(id);
    showNotice("Ресурс видалено");
    await loadResources();
  } catch (e) {
    showApiError(e as ApiError);
  }
}

async function onResourceFormSubmit(e: Event): Promise<void> {
  e.preventDefault();
  const btn = document.getElementById("submitResourceBtn") as HTMLButtonElement;
  const label = editingId ? "Зберегти зміни" : "Додати ресурс";

  const userId = Number((document.getElementById("resUserId") as HTMLSelectElement).value);
  const title = (document.getElementById("resTitle") as HTMLInputElement).value.trim();
  const link = (document.getElementById("resLink") as HTMLInputElement).value.trim();
  const type = (document.getElementById("resType") as HTMLSelectElement).value;
  const author = (document.getElementById("resAuthor") as HTMLInputElement).value.trim();
  const description = (document.getElementById("resDescription") as HTMLTextAreaElement).value.trim();

  
  if (!userId) return showNotice("Оберіть користувача", true);
  if (title.length < 3) return showNotice("Назва мінімум 3 символи", true);
  if (!link.startsWith("http")) return showNotice("Некоректне посилання", true);
  if (!type) return showNotice("Оберіть тип", true);
  if (!author) return showNotice("Введіть автора", true);

  setButtonLoading(btn, true, label);

  try {
    if (editingId) {
      await resourcesApi.update(editingId, { title, link, type, author, description, userId });
      showNotice("Ресурс оновлено");
      editingId = null;
    } else {
      await resourcesApi.create({ userId, title, link, type, author, description });
      showNotice("Ресурс створено");
    }
    clearResourceForm();
    btn.textContent = "Додати ресурс";
    await loadResources();
  } catch (e) {
    showApiError(e as ApiError);
  } finally {
    setButtonLoading(btn, false, editingId ? "Зберегти зміни" : "Додати ресурс");
  }
}

async function loadUsers(): Promise<void> {
  try {
    const users = await usersApi.getAll();
    renderUsersDropdown(users ?? []);
  } catch (e) {
    showApiError(e as ApiError);
  }
}

async function onUserFormSubmit(e: Event): Promise<void> {
  e.preventDefault();
  const btn = document.getElementById("submitUserBtn") as HTMLButtonElement;
  const name = (document.getElementById("userName") as HTMLInputElement).value.trim();
  const email = (document.getElementById("userEmail") as HTMLInputElement).value.trim();
  const role = (document.getElementById("userRole") as HTMLSelectElement).value;

  if (!name) return showNotice("Введіть ім'я", true);
  if (!email.includes("@")) return showNotice("Некоректний email", true);

  setButtonLoading(btn, true, "Створити");
  try {
    await usersApi.create({ name, email, role });
    showNotice("Користувача створено");
    (document.getElementById("userForm") as HTMLFormElement).reset();
    await loadUsers();
  } catch (e) {
    showApiError(e as ApiError);
  } finally {
    setButtonLoading(btn, false, "Створити");
  }
}

async function loadFeedbacks(resourceId: number): Promise<void> {
  currentFeedbackResourceId = resourceId;
  showStatus("feedbackStatus", "loading");
  try {
    const data = await feedbackApi.getByResource(resourceId);
    if (!data || data.length === 0) {
      showStatus("feedbackStatus", "empty");
      renderFeedbacks([], onDeleteFeedback);
    } else {
      showStatus("feedbackStatus", "success");
      renderFeedbacks(data, onDeleteFeedback);
    }
  } catch (e) {
    showStatus("feedbackStatus", "error", e as ApiError);
    showApiError(e as ApiError);
  }
}

async function onDeleteFeedback(id: number): Promise<void> {
  try {
    await feedbackApi.remove(id, currentFeedbackResourceId!);
    showNotice("Відгук видалено");
    if (currentFeedbackResourceId) await loadFeedbacks(currentFeedbackResourceId);
  } catch (e) {
    showApiError(e as ApiError);
  }
}

async function onFeedbackFormSubmit(e: Event): Promise<void> {
  e.preventDefault();
  const btn = document.getElementById("submitFeedbackBtn") as HTMLButtonElement;
  const resourceId = Number((document.getElementById("feedbackResource") as HTMLSelectElement).value);
  const userId = Number((document.getElementById("feedbackUserId") as HTMLSelectElement).value);
  const rating = Number((document.getElementById("feedbackRating") as HTMLInputElement).value);
  const comment = (document.getElementById("feedbackComment") as HTMLTextAreaElement).value.trim();

  if (!resourceId) return showNotice("Оберіть ресурс", true);
  if (!userId) return showNotice("Оберіть користувача", true);
  if (rating < 1 || rating > 5) return showNotice("Оцінка від 1 до 5", true);
  if (!comment) return showNotice("Введіть коментар", true);

  setButtonLoading(btn, true, "Опублікувати");
  try {
    await feedbackApi.create({ resourceId, userId, rating, comment });
    showNotice("Відгук додано");
    (document.getElementById("feedbackForm") as HTMLFormElement).reset();
    await loadFeedbacks(resourceId);
    await loadTopLiked();
  } catch (e) {
    showApiError(e as ApiError);
  } finally {
    setButtonLoading(btn, false, "Опублікувати");
  }
}

async function loadTopLiked(): Promise<void> {
  showStatus("topLikedStatus", "loading");
  try {
    const data = await resourcesApi.topLiked();
    if (!data || data.length === 0) {
      showStatus("topLikedStatus", "empty");
    } else {
      showStatus("topLikedStatus", "success");
      renderTopLiked(data);
    }
  } catch (e) {
    showStatus("topLikedStatus", "error", e as ApiError);
  }
}

document.getElementById("resourceForm")?.addEventListener("submit", onResourceFormSubmit);
document.getElementById("userForm")?.addEventListener("submit", onUserFormSubmit);
document.getElementById("feedbackForm")?.addEventListener("submit", onFeedbackFormSubmit);

document.getElementById("filterType")?.addEventListener("change", loadResources);
document.getElementById("sortBy")?.addEventListener("change", loadResources);
document.getElementById("sortDir")?.addEventListener("change", loadResources);

document.getElementById("feedbackResource")?.addEventListener("change", (e) => {
  const id = Number((e.target as HTMLSelectElement).value);
  if (id) loadFeedbacks(id);
});

document.getElementById("cancelEditBtn")?.addEventListener("click", () => {
  editingId = null;
  clearResourceForm();
  (document.getElementById("submitResourceBtn") as HTMLButtonElement).textContent = "Додати ресурс";
});

async function init(): Promise<void> {
  await Promise.all([loadUsers(), loadResources(), loadTopLiked()]);
}

init();