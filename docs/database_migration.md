# Инструкция по миграции базы данных

## Добавление нового поля data_retention_period

В рамках разработки функциональности хранения данных мы добавили новое поле `data_retention_period` в таблицу `user_settings`. Это поле определяет срок хранения записей о времени (в месяцах).

## Как применить миграцию

1. Зайдите в панель управления Supabase: https://app.supabase.io/
2. Выберите ваш проект
3. Перейдите в раздел "SQL Editor" (SQL редактор)
4. Создайте новый запрос
5. Вставьте содержимое файла `sql/apply_migration.sql`
6. Выполните запрос

## Настройка автоматической очистки старых записей (опционально)

Если у вас есть доступ к расширению `pg_cron` (доступно в некоторых тарифах Supabase) или вы используете свой PostgreSQL сервер:

1. Зайдите в панель управления Supabase или подключитесь к своему PostgreSQL серверу
2. Выполните запрос из файла `sql/scheduled_cleanup.sql`

## Альтернативный способ автоматической очистки

Если расширение `pg_cron` недоступно, вы можете настроить регулярное выполнение очистки с помощью внешних сервисов:

1. Создайте API-эндпоинт, который будет вызывать функцию `cleanOldTimeEntries` из `settingsService`
2. Настройте регулярное выполнение этого эндпоинта с помощью:
   - Cron на вашем сервере
   - Облачных сервисов планирования (например, AWS Lambda с EventBridge)
   - Сервисов типа Zapier, n8n или Pipedream
   - Сервисов типа cron-job.org или similar.io

## Проверка

После выполнения миграции вы можете проверить, что поле добавлено, выполнив запрос:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND column_name = 'data_retention_period';
```

Должен вернуться один результат с типом `integer`. 