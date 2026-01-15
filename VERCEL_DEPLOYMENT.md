# 🚀 Vercel Deployment Guide

## Проблема: Cannot find module '@prisma/adapter-pg'

Эта ошибка возникает из-за того, что Vercel не копирует Prisma пакеты в `.output/server/node_modules/@prisma/`.

## ✅ Решение

### 1. Настройки в Vercel Dashboard

Зайди в: **Project Settings → General → Build & Development Settings**

```
Framework Preset: Nuxt.js
Build Command: bun run build
Install Command: bun install
Output Directory: .output/public
Node.js Version: 20.x
```

### 2. Environment Variables

Обязательные переменные (Settings → Environment Variables):

```bash
# База данных
DATABASE_URL=postgresql://...

# Auth
NUXT_AUTH_SECRET=минимум-32-символа-случайная-строка
NUXT_SESSION_PASSWORD=твой-пароль

# App URL (обнови после первого деплоя!)
APP_URL=https://твой-проект.vercel.app

# Redis (скопируй из KV_REST_API_*)
UPSTASH_REDIS_REST_URL=скопируй-из-KV_REST_API_URL
UPSTASH_REDIS_REST_TOKEN=скопируй-из-KV_REST_API_TOKEN

# QStash (уже созданы Vercel)
QSTASH_TOKEN=xxx
QSTASH_CURRENT_SIGNING_KEY=xxx
QSTASH_NEXT_SIGNING_KEY=xxx

# Очередь и планировщик
WORKFLOW_QUEUE_MODE=required
WORKFLOW_SCHEDULER_MODE=serverless
# Опционально: защита cron/email endpoints (нужны заголовки при вызове)
SCHEDULER_SECRET=случайный-секрет
```

### 3. Проверь Build Script

В `package.json` должно быть:

```json
"build": "bunx nuxt prepare && bunx nuxt build && bun scripts/copy-prisma.mjs"
```

**ВАЖНО**: `bun scripts/copy-prisma.mjs` ОБЯЗАТЕЛЬНО должен быть последним!

Если хочешь применять миграции на деплое, используй `build:migrate` и поставь
Build Command на `bun run build:migrate`.

### 4. Планировщик (serverless)

В проде локальные таймеры отключены. Для cron/email нужны внешние вызовы.

Вариант A: Vercel Cron Jobs (без заголовков)
1) Добавь Cron Job: `GET /api/cron/run` с расписанием `* * * * *`
2) Добавь Cron Job: `GET /api/email/poll` с расписанием `*/5 * * * *`
3) Если используешь Vercel Cron и не можешь передать заголовки, оставь
   `SCHEDULER_SECRET` пустым (авторизация отключится).
4) Если Cron Jobs добавлены в `vercel.json`, убедись что `SCHEDULER_SECRET`
   пустой, иначе вызовы будут отклонены.

Вариант B: Upstash QStash Schedule (с заголовками)
1) Создай два schedule в QStash с теми же расписаниями и `POST` методом
2) Передавай заголовок `x-scheduler-secret: <SCHEDULER_SECRET>`

### 5. Swagger UI

Документация доступна на `/docs`, OpenAPI JSON на `/api/docs`.

### 6. Проверь что файлы существуют

- ✅ `scripts/copy-prisma.mjs` - копирует Prisma модули
- ✅ `vercel.json` - конфиг Vercel
- ✅ `app/lib/prisma.ts` - Prisma клиент с адаптером
- ✅ `nuxt.config.ts` - с prismaTraceInclude

### 7. Deploy

```bash
git add .
git commit -m "fix: vercel deployment config"
git push
```

Или через Vercel Dashboard → Deployments → Redeploy

---

## Логи билда

Если ошибка повторяется, проверь в логах:

1. **Install phase**: Должен установиться `@prisma/adapter-pg`
2. **Build phase**: Должен выполниться `bun scripts/copy-prisma.mjs`
3. **Output**: Проверь что создалась папка `.output/server/node_modules/@prisma/adapter-pg`

---

## Если не помогло

1. Убедись что в Vercel используется **Bun**, а не npm/yarn
2. Попробуй изменить Install Command на: `npm install` (иногда помогает)
3. Проверь что NODE_VERSION=20 в переменных окружения
