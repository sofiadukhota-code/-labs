export interface ResourceQueryDto {
    type?: string;        // 5.1 Фільтрація за типом (book, video...)
    author?: string;      // 5.1 Фільтрація за автором
    sortBy?: string;      // 5.3 Поле для сортування (title, createdAt)
    sortDir?: 'asc' | 'desc'; // 5.3 Напрямок
}