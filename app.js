let items = [];
let editId = null;

const STORAGE_KEY = 'lab1_resourses';
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data !== null) {
        return JSON.parse(data);
    } else {
        return []
    }
}

const form = document.getElementById('form');
const title = document.getElementById('title');
const link = document.getElementById('link');
const statusSelect = document.getElementById('statusSelect');
const description = document.getElementById('descriptionInput');
const author = document.getElementById('author');
const itemsTable = document.getElementById('itemsTable');
const itemsTableBody = document.getElementById('itemsTableBody');
const search = document.getElementById('searchInput');
const filterType = document.getElementById('filterType');

const title_error = document.getElementById('title_error');
const link_error = document.getElementById('link_error');
const status_error = document.getElementById('status_error');
const description_error = document.getElementById('description_error');
const author_error = document.getElementById('author_error');

function readForm() {
    return {
        id: editId || Date.now(),
        title: document.getElementById('title').value.trim(),
        link: document.getElementById('link').value.trim(),
        type: document.getElementById('statusSelect').value,
        author: document.getElementById('author').value.trim(),
        description: document.getElementById('descriptionInput').value.trim()
    }
}

function validate (dto) {
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

function clearerrors () {
    const inputs = [title, link, statusSelect, description, author];
    const errortext = [title_error, link_error, status_error, description_error, author_error];

    inputs.forEach(input => input.classList.remove('invalid'));
    errortext.forEach(error => error.innerHTML = "")
}

function renderTable(dataRender = items){
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

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const dto = readForm();
    if (validate(dto)) {
        if (editId) {
            const index = items.findIndex(i => i.id === editId);
            items[index] = dto;
            editId = null;
            form.querySelector('button[type="submit"]').textContent = "Add";
        } else {
            items.push(dto)
        }
        saveToStorage();
        renderTable();
        form.reset();
    }
})

itemsTableBody.addEventListener('click', function(e) {
    const target = e.target;
    const id = Number(target.dataset.id);
    if (target.classList.contains('delete')) {
        items = items.filter(item => item.id !== id);
        saveToStorage()
        renderTable()
    }
    if (e.target.classList.contains('edit')) {
        const item = items.find(i => i.id === id);
        title.value = item.title;
        link.value = item.link;
        statusSelect.value = item.type;
        author.value = item.author;
        description.value = item.description;
        editId = id;
        form.querySelector('button[type="submit"]').textContent = "Save Changes";
    }
})

search.addEventListener('input', function(e) {
    const searchText = e.target.value.toLowerCase();
    const filtered = items.filter(item =>
        item.title.toLowerCase().includes(searchText)
    )
    renderTable(filtered);
})
filterType.addEventListener('change', function(e) {
    const val = e.target.value;
    let dataRender;

    if(val === 'all') {
        dataRender = items;
    }else{
        dataRender = items.filter(item => item.type === val);
    }
    renderTable(dataRender);
})
items = loadFromStorage();
renderTable();