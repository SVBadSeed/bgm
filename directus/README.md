# Directus для лендинга

Directus здесь — CMS лендинга: тексты, картинки, витрина туров, отзывы, формы.
Он **не** источник правды по продукту (туры/цены/места живут в `bogema-backend`).

## Запуск

```bash
cp .env.example .env        # в корне репо; поменять пароли и KEY/SECRET
pnpm directus:up            # Directus 11 + Postgres, http://localhost:8055
pnpm directus:seed          # коллекции + права публичной роли
pnpm directus:seed:content  # демо-контент из прототипа (только в пустые коллекции)
```

Логин админки — `DIRECTUS_ADMIN_EMAIL` / `DIRECTUS_ADMIN_PASSWORD` из `.env`.

## Схема как код

- `scripts/seed-schema.mjs` — декларация коллекций и полей (первичный сид).
- `schema/snapshot.yaml` — снимок схемы из живого инстанса, это то, что уезжает на сервер.

Правило: **что-то поменял в админке → `pnpm directus:snapshot` → закоммитил `schema/snapshot.yaml`.**
На другом окружении `pnpm directus:apply` приводит схему к снимку.

Сид-скрипт после первого запуска не трогаем как «мастер-копию» — мастер теперь снимок.
Сид остаётся для чистого развёртывания с нуля и как читаемая документация полей.

## Коллекции

| Коллекция | Что это | Публичный доступ |
|---|---|---|
| `site_settings` (singleton) | телефон, почта, адрес, соцсети, копирайт | read |
| `landing` (singleton) | SEO, заголовки секций, промо, тексты форм | read |
| `menu_items` | пункты шапки и футера (`placement`) | read (published) |
| `hero_slides` | слайды hero: фото + регион + подпись | read (published) |
| `destinations` | карточки направлений | read (published) |
| `tours` | карточки витрины, `kind` = excursion / tour | read (published) |
| `advantages` | блок «Почему мы» | read (published) |
| `reviews` | отзывы, M2O на `tours` | read (published) |
| `subscribers` | подписка на рассылку | create (email, source) |
| `leads` | заявки с форм | create |

Все картинки — стандартные `directus_files`; фронт строит URL через `/assets/<id>?width=…&format=webp`.

## Почему Directus 11, а не 12

В 12.x сменилась лицензия (MSCL) и кастомные правила прав ушли в платные тиры.
Нам нужны фильтры `status = published` для публичной роли — на 11.x (BUSL, бесплатно
до $5M выручки) это работает без ограничений. Переезд на 12 — отдельное решение.
