# 🗄️ Database Migrations Guide

## Первый деплой - примени миграции вручную:

### 1. Получи DATABASE_URL из Vercel

В Vercel Dashboard:
- Settings → Environment Variables → DATABASE_URL → показать значение
- Скопируй весь URL: `postgresql://...`

### 2. Примени миграции локально к продакшен БД

```bash
cd /home/gregulas/Frontend/Finger_automation_app

# Установи переменную
export DATABASE_URL="postgresql://твой-vercel-postgres-url"

# Примени все миграции
bunx prisma migrate deploy

# Проверь что всё окей
bunx prisma db push
```

**Альтернатива через .env:**

```bash
# Создай временный .env.production
echo 'DATABASE_URL="postgresql://твой-url"' > .env.production

# Примени миграции
bunx prisma migrate deploy --schema=prisma/schema.prisma

# Удали файл
rm .env.production
```

---

## 📝 При изменении схемы Prisma:

### Локальная разработка:

```bash
# Создай миграцию
bunx prisma migrate dev --name описание_изменения

# Это автоматически применит к локальной БД
```

### Продакшен (Vercel):

```bash
# Примени новые миграции к продакшен БД
DATABASE_URL="твой-vercel-url" bunx prisma migrate deploy

# Или через скрипт (если добавишь миграции через git)
bun run build:migrate
```

---

## ⚠️ Важно!

1. **НЕ запускай миграции во время build** - это замедляет деплой
2. **Примени миграции ДО деплоя** новой версии с изменениями схемы
3. **Бэкапь БД** перед применением миграций в продакшен
4. Миграции должны быть **backward compatible** для zero-downtime деплоя

---

## 🚀 CI/CD автоматизация (опционально):

Добавь GitHub Action для автоматических миграций:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
      
      - name: Run migrations
        run: bunx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Deploy to Vercel
        run: vercel deploy --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```
