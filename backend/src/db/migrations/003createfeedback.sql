CREATE TABLE IF NOT EXISTS Feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resourceId INTEGER NOT NULL,
     userId INTEGER NOT NULL,
    comment TEXT NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    createdAt TEXT NOT NULL,
    FOREIGN KEY (resourceId) REFERENCES Resources (id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE RESTRICT
);