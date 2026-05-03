CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'admin')),
    name TEXT NOT NULL,
    createdAt TEXT NOT NULL
);