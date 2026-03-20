Варіант №5: Каталог навчальних ресурсів з рейтингом

1. Як запустити: 
    - встановлення залежностей: npm install
    - запуск: npm run dev
    - компіляція: npm run build
    - запуск скомпільованого коду: npm start

2. Список реалізованих сутностей:
    Users - автори ресурсів та відгуків (id, username, email, role)

    Resources - основний каталог (id, title, link, type, author, description)

    Feedbacks -  оцінки, що пов'язують користувачів та ресурси

3. Приклади запитів (curl)
    Resources:
    - POST curl -X POST http://localhost:3000/api/resources \
         -H "Content-Type: application/json" \
        -d '{"title": "Code", "link": "http://example.com/", "type": "book", "author": "Robert Martin", "description": "Classic book"}'
    - GET curl "http://localhost:3000/api/resources?type=book&sortBy=title&sortDir=asc"
    - PATCH curl -X PATCH http://localhost:3000/api/resources/[ID] \
     -H "Content-Type: application/json" \
     -d '{"title": "Clean Code: Revised Edition"}'

    Users:
    - Отримати список користувачів: curl http://localhost:3000/api/users
    - DELETE: curl -X DELETE http://localhost:3000/api/users/[ID]

    Feedbacks:
    - Додати відгук: curl -X POST http://localhost:3000/api/feedbacks \
     -H "Content-Type: application/json" \
     -d '{"resourceId": "[ID-РЕСУРСУ]", "userId": "[ID-ЮЗЕРА]", "rating": 5, "comment": "Excellent material!"}' 

Виконано на рівень "відмінно"
