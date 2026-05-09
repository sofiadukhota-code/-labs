let noticeTimer = null;
export function showNotice(text, isError = false) {
    const el = document.getElementById("notice");
    el.textContent = text;
    el.className = isError ? "notice error" : "notice success";
    if (noticeTimer)
        clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => {
        el.textContent = "";
        el.className = "notice";
    }, 4000);
}
export function showApiError(err) {
    showNotice(`Помилка (${err.status}): ${err.message}`, true);
}
export function showStatus(containerId, status, err) {
    const el = document.getElementById(containerId);
    if (status === "loading")
        el.textContent = "Завантаження...";
    else if (status === "empty")
        el.textContent = "Записів немає.";
    else if (status === "error")
        el.textContent = `Помилка: ${err?.message ?? "невідома"}`;
    else
        el.textContent = "";
}
export function renderResources(resources, onEdit, onDelete) {
    const tbody = document.getElementById("resourcesTableBody");
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
    tbody.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const resource = resources.find((r) => r.id === id);
            if (resource)
                onEdit(resource);
        });
    });
    tbody.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (confirm("Видалити ресурс?"))
                onDelete(Number(btn.dataset.id));
        });
    });
}
export function renderUsersDropdown(users) {
    const selects = document.querySelectorAll(".user-select");
    selects.forEach((sel) => {
        const current = sel.value;
        sel.innerHTML =
            '<option value="">Оберіть користувача</option>' +
                users.map((u) => `<option value="${u.id}">${u.name} (${u.email})</option>`).join("");
        sel.value = current;
    });
}
export function renderResourcesDropdown(resources) {
    const sel = document.getElementById("feedbackResource");
    if (!sel)
        return;
    const current = sel.value;
    sel.innerHTML =
        '<option value="">Оберіть ресурс</option>' +
            resources.map((r) => `<option value="${r.id}">${r.title}</option>`).join("");
    sel.value = current;
}
export function renderFeedbacks(feedbacks, onDelete) {
    const el = document.getElementById("feedbackList");
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
    el.querySelectorAll(".btn-delete-feedback").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (confirm("Видалити відгук?"))
                onDelete(Number(btn.dataset.id));
        });
    });
}
export function renderTopLiked(items) {
    const el = document.getElementById("topLikedList");
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
export function setButtonLoading(btn, loading, label) {
    btn.disabled = loading;
    btn.textContent = loading ? "Зачекайте..." : label;
}
export function fillResourceForm(r) {
    document.getElementById("resTitle").value = r.title;
    document.getElementById("resLink").value = r.link;
    document.getElementById("resType").value = r.type;
    document.getElementById("resAuthor").value = r.author;
    document.getElementById("resDescription").value = r.description ?? "";
}
export function clearResourceForm() {
    document.getElementById("resourceForm").reset();
}
//# sourceMappingURL=ui.js.map