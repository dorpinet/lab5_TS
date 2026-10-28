# Практична робота № 5

Варіант: 2

Тема: модульна архітектура та ін'єкція залежностей у NestJS.

Опис: система книжкового онлайн-магазину декомпонована на три модуля: `BooksModule` (каталог), `OrdersModule` (замовлення) та `SharedModule` (спільні утиліти й конфігурація). Модулі взаємодіють через Dependency Injection.

## Встановлення та запуск

```bash
git clone https://github.com/dorpinet/lab5_TS.git
cd lab5_TS
npm install
npm run start:dev
```

Сервер запускається за адресою: http://localhost:3000

Перевірка збірки без помилок:

```bash
npm run build
```

Ручне тестування: файл `requests.http` (розширення REST Client для VS Code).

## Як створено проєкт

```bash
npx @nestjs/cli g mo books
npx @nestjs/cli g mo shared
npx @nestjs/cli g s shared/slug --no-spec
npx @nestjs/cli g mo orders
npx @nestjs/cli g s orders --no-spec
npx @nestjs/cli g co orders --no-spec
```

## Структура

```
src/
├── main.ts
├── app.module.ts
├── books/
│   ├── books.module.ts
│   ├── books.controller.ts
│   ├── books.service.ts
│   ├── dto/
│   └── entities/
├── orders/
│   ├── orders.module.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   ├── order.entity.ts
│   └── dto/
└── shared/
    ├── shared.module.ts
    ├── slug/
    │   └── slug.service.ts
    └── config/
        ├── app-config.provider.ts
        └── fee-calculator.provider.ts
```

## Архітектура модулів

| Модуль | Imports | Providers | Exports |
|---|---|---|---|
| AppModule | BooksModule, OrdersModule, SharedModule | немає | немає |
| BooksModule | SharedModule | BooksService | BooksService |
| OrdersModule | BooksModule, SharedModule | OrdersService | немає |
| SharedModule | немає | SlugService, STORE_CONFIG, FEE_CALCULATOR | SlugService, STORE_CONFIG, FEE_CALCULATOR |

## Ендпоінти

| Метод | Шлях | Опис | Статуси |
|---|---|---|---|
| GET | /books | список книг | 200 |
| GET | /books/:id | книга за id | 200, 404 |
| POST | /books | створити книгу (генерується slug) | 201, 400, 409 |
| PATCH | /books/:id | часткове оновлення | 200, 400, 404, 409 |
| DELETE | /books/:id | видалити книгу | 204, 404 |
| GET | /orders | список замовлень | 200 |
| POST | /orders | створити замовлення | 201, 400, 404 |

## Реалізація

**Рівень 1:**
- `BooksController` і `BooksService` перенесено з `AppModule` у `BooksModule`, у кореневому модулі залишився лише масив `imports`;
- створено `SharedModule` із `SlugService`, який експортується;
- `SlugService.generateSlug` транслітерує кирилицю, переводить рядок у нижній регістр і замінює спеціальні символи на дефіси (`"Pro Laptop 16"` → `"pro-laptop-16"`);
- `SharedModule` імпортовано в `BooksModule`, `SlugService` впроваджено в `BooksService` через конструктор, slug автоматично генерується при створенні та оновленні назви книги.

**Рівень 2:**
- створено `OrdersModule` з `OrdersService` та `OrdersController`;
- `BooksModule` експортує `BooksService`, `OrdersModule` імпортує `BooksModule`, `BooksService` впроваджено в `OrdersService`;
- `createOrder` перевіряє наявність товару через `BooksService.findOne` (якщо не знайдено, кидається `NotFoundException`), рахує підсумок, додає податок і зберігає замовлення в in-memory списку;
- `STORE_CONFIG` зареєстровано через `useValue` (назва магазину, валюта UAH, податок 20%);
- `FEE_CALCULATOR` зареєстровано через `useFactory` з `inject: [STORE_CONFIG]`, він повертає об'єкт із методом `calculateTax`;
- `STORE_CONFIG` та `FEE_CALCULATOR` впроваджено в `OrdersService` через `@Inject()`;
- DTO замовлення валідується через `class-validator` (`productId`, `quantity >= 1`, `customerEmail`).

## Приклад замовлення

Запит:

```json
{
  "productId": "1",
  "quantity": 2,
  "customerEmail": "student@college.edu"
}
```

Відповідь (201 Created):

```json
{
  "orderId": "ord-...",
  "productId": "1",
  "productTitle": "bebebbe",
  "productSlug": "bebebbe",
  "unitPrice": 750,
  "quantity": 2,
  "subtotal": 1500,
  "taxAmount": 300,
  "total": 1800,
  "currency": "UAH",
  "customerEmail": "student@college.edu",
  "status": "confirmed",
  "createdAt": "..."
}
```

## Скріншоти

### Запуск сервера: модулі ініціалізовано, маршрути `/books` та `/orders` зареєстровано

![Запуск сервера](screenshots/Screenshot%202026-10-28%20181718.png)

Запити

![запит книжок](screenshots/Screenshot%202026-10-28%20183929.png)

![створення книги](screenshots/Screenshot%202026-10-28%20184020.png)

![404](screenshots/Screenshot%202026-10-28%20184025.png)

![400](screenshots/Screenshot%202026-10-28%20184037.png)

![Список замовлень](screenshots/Screenshot%202026-10-28%20184042.png)

# Висновки

Під час роботи систему інтернет-магазину реорганізовано в модульну архітектуру з трьох модулів. Засвоєно інкапсуляцію провайдерів: сервіс доступний іншому модулю лише після додавання в `exports` власного модуля та `imports` модуля-споживача. Реалізовано кастомні провайдери за стратегіями `useValue` (конфігурація магазину) і `useFactory` (калькулятор податку, який отримує конфігурацію через `inject`) та використано токени ін'єкції разом із декоратором `@Inject()`. Міжмодульну взаємодію продемонстровано на прикладі `OrdersService`, що перевіряє наявність товару та його ціну через `BooksService`.
