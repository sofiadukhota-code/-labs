const API_URL = 'http://localhost:3000/api';
let items = [];
let editId = null;

const form = document.getElementById('form');
const title = document.getElementById('title');
const link = document.getElementById('link');
const statusSelect = document.getElementById('statusSelect');
const description = document.getElementById('descriptionInput');
const author = document.getElementById('author');

const itemsTableBody = document.getElementById('itemsTableBody');
const search = document.getElementById('searchInput');
const filterType = document.getElementById('filterType');

const title_error = document.getElementById('title_error');
const link_error = document.getElementById('link_error');
const status_error = document.getElementById('status_error');
const author_error = document.getElementById('author_error');
const description_error = document.getElementById('description_error');

function readForm() {
    return {
        title: document.getElementById('title').value.trim(),
        link: document.getElementById('link').value.trim(),
        type: document.getElementById('statusSelect').value,
        author: document.getElementById('author').value.trim(),
        description: document.getElementById('descriptionInput').value.trim()
    }
}

function validate(dto) {
    clearerrors();
    let isvalid = true;
    if (dto.title.length < 3) {
        showerror(title, title_error, "min 3 letters is required");
        isvalid = false;
    }
    if (dto.link === "") {
        showerror(link, link_error, "link is required");
        isvalid = false;
    } else if (!dto.link.startsWith('http')) {
        showerror(link, link_error, "incorrect link");
        isvalid = false;
    }
    if (dto.type === "") {
        showerror(statusSelect, status_error, "choose type");
        isvalid = false;
    }
    if (dto.author.trim() === "") {
        showerror(author, author_error, "surname And name or initials is required");
        isvalid = false;
    }
    return isvalid;
}

function showerror(inputElement, errorElement, message) {
    inputElement.classList.add('invalid');
    errorElement.innerHTML = message;
}

function clearerrors() {
    const inputs = [title, link, statusSelect, description, author];
    const errortext = [title_error, link_error, status_error, description_error, author_error];
    inputs.forEach(input => input.classList.remove('invalid'));
    errortext.forEach(error => error.innerHTML = "")
}

async function loadData() {
    try {
        const response = await fetch(`${API_URL}/resources`);
        items = await response.json();
        renderTable();
        refreshResourceDropdown();
    } catch (err) {
        console.error("Сервер вимкнено або помилка CORS");
    }
}

function renderTable(dataRender = items) {
    itemsTableBody.innerHTML = dataRender.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.title}</td>
            <td>${item.type}</td>
            <td>${item.author}</td>
            <td>
            <button class="edit" data-id="${item.id}">Edit</button>
            <button class="delete" data-id="${item.id}">Delete</button>
            </td>
        </tr>
        `).join("");
}


form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const dto = readForm();
    
    if (validate(dto)) {
        try {
            if (editId) {
                // Оновлення (PUT)
                await fetch(`${API_URL}/resources/${editId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dto)
                });
                editId = null;
                form.querySelector('button[type="submit"]').textContent = "Add";
            } else {
                // Створення (POST)
                await fetch(`${API_URL}/resources`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dto)
                });
            }
            form.reset();
            await loadData();
        } catch (err) {
        }
    }
});


itemsTableBody.addEventListener('click', async function(e) {
    const target = e.target;
    const id = target.dataset.id;

    if (target.classList.contains('delete')) {
    const id = target.dataset.id;
    
    if (confirm("Ви точно хочете видалити цей запис?")) {
        try {
            const response = await fetch(`${API_URL}/resources/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await loadData();
                console.log(`Ресурс ${id} успішно видалено`);
            }
        } catch (err) {
            console.error("Помилка при видаленні:", err);
        }
    }
}
    if (target.classList.contains('edit')) {
        const item = items.find(i => i.id === id);
        title.value = item.title;
        link.value = item.link;
        statusSelect.value = item.type;
        author.value = item.author;
        description.value = item.description;
        editId = id;
        form.querySelector('button[type="submit"]').textContent = "Зберегти";
    }
});

const userForm = document.getElementById('user-form');
if (userForm) {
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            role: document.getElementById('userRole').value
        };
        await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        userForm.reset();
    });
}

function refreshResourceDropdown() {
    const select = document.getElementById('targetResource');
    if (select) {
        select.innerHTML = '<option value="">Оберіть ресурс</option>' + 
            items.map(i => `<option value="${i.id}">${i.title}</option>`).join('');
    }
}

search.addEventListener('input', function(e) {
    const searchText = e.target.value.toLowerCase();
    const filtered = items.filter(item => item.title.toLowerCase().includes(searchText))
    renderTable(filtered);
});

loadData();