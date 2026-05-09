import { resourcesApi, usersApi, feedbackApi } from "./apiClient";
import { showNotice, showApiError, showStatus, renderResources, renderUsersDropdown, renderResourcesDropdown, renderFeedbacks, renderTopLiked, setButtonLoading, fillResourceForm, clearResourceForm, } from "./ui";
let allResources = [];
let editingId = null;
let currentFeedbackResourceId = null;
async function loadResources() {
    showStatus("resourcesStatus", "loading");
    try {
        const type = document.getElementById("filterType").value;
        const sortBy = document.getElementById("sortBy").value;
        const sortDir = document.getElementById("sortDir").value;
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
        }
        else {
            showStatus("resourcesStatus", "success");
            renderResources(allResources, onEdit, onDelete);
        }
        renderResourcesDropdown(allResources);
    }
    catch (e) {
        showStatus("resourcesStatus", "error", e);
        showApiError(e);
    }
}
function onEdit(resource) {
    editingId = resource.id;
    fillResourceForm(resource);
    document.getElementById("submitResourceBtn").textContent = "Зберегти зміни";
    document.getElementById("resourceForm")?.scrollIntoView({ behavior: "smooth" });
}
async function onDelete(id) {
    try {
        await resourcesApi.remove(id);
        showNotice("Ресурс видалено");
        await loadResources();
    }
    catch (e) {
        showApiError(e);
    }
}
async function onResourceFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById("submitResourceBtn");
    const label = editingId ? "Зберегти зміни" : "Додати ресурс";
    const userId = Number(document.getElementById("resUserId").value);
    const title = document.getElementById("resTitle").value.trim();
    const link = document.getElementById("resLink").value.trim();
    const type = document.getElementById("resType").value;
    const author = document.getElementById("resAuthor").value.trim();
    const description = document.getElementById("resDescription").value.trim();
    if (!userId)
        return showNotice("Оберіть користувача", true);
    if (title.length < 3)
        return showNotice("Назва мінімум 3 символи", true);
    if (!link.startsWith("http"))
        return showNotice("Некоректне посилання", true);
    if (!type)
        return showNotice("Оберіть тип", true);
    if (!author)
        return showNotice("Введіть автора", true);
    setButtonLoading(btn, true, label);
    try {
        if (editingId) {
            await resourcesApi.update(editingId, { title, link, type, author, description, userId });
            showNotice("Ресурс оновлено");
            editingId = null;
        }
        else {
            await resourcesApi.create({ userId, title, link, type, author, description });
            showNotice("Ресурс створено");
        }
        clearResourceForm();
        btn.textContent = "Додати ресурс";
        await loadResources();
    }
    catch (e) {
        showApiError(e);
    }
    finally {
        setButtonLoading(btn, false, editingId ? "Зберегти зміни" : "Додати ресурс");
    }
}
async function loadUsers() {
    try {
        const users = await usersApi.getAll();
        renderUsersDropdown(users ?? []);
    }
    catch (e) {
        showApiError(e);
    }
}
async function onUserFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById("submitUserBtn");
    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    const role = document.getElementById("userRole").value;
    if (!name)
        return showNotice("Введіть ім'я", true);
    if (!email.includes("@"))
        return showNotice("Некоректний email", true);
    setButtonLoading(btn, true, "Створити");
    try {
        await usersApi.create({ name, email, role });
        showNotice("Користувача створено");
        document.getElementById("userForm").reset();
        await loadUsers();
    }
    catch (e) {
        showApiError(e);
    }
    finally {
        setButtonLoading(btn, false, "Створити");
    }
}
async function loadFeedbacks(resourceId) {
    currentFeedbackResourceId = resourceId;
    showStatus("feedbackStatus", "loading");
    try {
        const data = await feedbackApi.getByResource(resourceId);
        if (!data || data.length === 0) {
            showStatus("feedbackStatus", "empty");
            renderFeedbacks([], onDeleteFeedback);
        }
        else {
            showStatus("feedbackStatus", "success");
            renderFeedbacks(data, onDeleteFeedback);
        }
    }
    catch (e) {
        showStatus("feedbackStatus", "error", e);
        showApiError(e);
    }
}
async function onDeleteFeedback(id) {
    try {
        await feedbackApi.remove(id);
        showNotice("Відгук видалено");
        if (currentFeedbackResourceId)
            await loadFeedbacks(currentFeedbackResourceId);
    }
    catch (e) {
        showApiError(e);
    }
}
async function onFeedbackFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById("submitFeedbackBtn");
    const resourceId = Number(document.getElementById("feedbackResource").value);
    const userId = Number(document.getElementById("feedbackUserId").value);
    const rating = Number(document.getElementById("feedbackRating").value);
    const comment = document.getElementById("feedbackComment").value.trim();
    if (!resourceId)
        return showNotice("Оберіть ресурс", true);
    if (!userId)
        return showNotice("Оберіть користувача", true);
    if (rating < 1 || rating > 5)
        return showNotice("Оцінка від 1 до 5", true);
    if (!comment)
        return showNotice("Введіть коментар", true);
    setButtonLoading(btn, true, "Опублікувати");
    try {
        await feedbackApi.create({ resourceId, userId, rating, comment });
        showNotice("Відгук додано");
        document.getElementById("feedbackForm").reset();
        await loadFeedbacks(resourceId);
    }
    catch (e) {
        showApiError(e);
    }
    finally {
        setButtonLoading(btn, false, "Опублікувати");
    }
}
async function loadTopLiked() {
    showStatus("topLikedStatus", "loading");
    try {
        const data = await resourcesApi.topLiked();
        if (!data || data.length === 0) {
            showStatus("topLikedStatus", "empty");
        }
        else {
            showStatus("topLikedStatus", "success");
            renderTopLiked(data);
        }
    }
    catch (e) {
        showStatus("topLikedStatus", "error", e);
    }
}
document.getElementById("resourceForm")?.addEventListener("submit", onResourceFormSubmit);
document.getElementById("userForm")?.addEventListener("submit", onUserFormSubmit);
document.getElementById("feedbackForm")?.addEventListener("submit", onFeedbackFormSubmit);
document.getElementById("filterType")?.addEventListener("change", loadResources);
document.getElementById("sortBy")?.addEventListener("change", loadResources);
document.getElementById("sortDir")?.addEventListener("change", loadResources);
document.getElementById("feedbackResource")?.addEventListener("change", (e) => {
    const id = Number(e.target.value);
    if (id)
        loadFeedbacks(id);
});
document.getElementById("cancelEditBtn")?.addEventListener("click", () => {
    editingId = null;
    clearResourceForm();
    document.getElementById("submitResourceBtn").textContent = "Додати ресурс";
});
async function init() {
    await Promise.all([loadUsers(), loadResources(), loadTopLiked()]);
}
init();
//# sourceMappingURL=main.js.map