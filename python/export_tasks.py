import argparse
import csv
import os
import sys
from datetime import datetime
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

BACKEND_ENV_PATH = Path(__file__).resolve().parent.parent / "backend" / ".env"


def get_db_connection():
    """Открывает соединение с PostgreSQL по данным из backend/.env."""
    if not BACKEND_ENV_PATH.exists():
        print(f"[Ошибка] Файл не найден: {BACKEND_ENV_PATH}")
        print("Убедитесь, что backend/.env существует (скопируйте backend/.env.example).")
        sys.exit(1)

    load_dotenv(dotenv_path=BACKEND_ENV_PATH)

    try:
        connection = psycopg2.connect(
            host=os.getenv("PGHOST", "localhost"),
            port=os.getenv("PGPORT", "5432"),
            dbname=os.getenv("PGDATABASE"),
            user=os.getenv("PGUSER"),
            password=os.getenv("PGPASSWORD"),
        )
        return connection
    except psycopg2.OperationalError as error:
        print("[Ошибка] Не удалось подключиться к PostgreSQL.")
        print(f"Причина: {error}")
        print("Проверьте файл .env (host, порт, имя базы, пользователь, пароль).")
        sys.exit(1)


def fetch_tasks(connection):
    """Забирает все задачи из таблицы tasks, отсортированные по дате создания."""
    query = """
        SELECT id, title, description, status, created_at
        FROM tasks
        ORDER BY created_at ASC;
    """

    try:
        with connection.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]
            return columns, rows
    except psycopg2.Error as error:
        print("[Ошибка] Не удалось выполнить запрос к таблице tasks.")
        print(f"Причина: {error}")
        print("Убедитесь, что таблица tasks создана (см. backend/db/init.sql).")
        sys.exit(1)


def save_to_csv(columns, rows, output_path):
    """Сохраняет результат запроса в CSV-файл с заголовком."""
    try:
        with open(output_path, mode="w", newline="", encoding="utf-8-sig") as csv_file:
            writer = csv.writer(csv_file)
            writer.writerow(columns)
            writer.writerows(rows)
    except OSError as error:
        print(f"[Ошибка] Не удалось записать файл {output_path}: {error}")
        sys.exit(1)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Экспорт задач из таблицы tasks (PostgreSQL) в CSV."
    )
    default_name = f"tasks_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    parser.add_argument(
        "--output",
        "-o",
        default=default_name,
        help=f"Имя выходного CSV-файла (по умолчанию: {default_name})",
    )
    return parser.parse_args()


def main():
    args = parse_args()

    connection = get_db_connection()
    try:
        columns, rows = fetch_tasks(connection)
    finally:
        connection.close()

    save_to_csv(columns, rows, args.output)

    print(f"Готово! Выгружено задач: {len(rows)}")
    print(f"Файл сохранён: {os.path.abspath(args.output)}")


if __name__ == "__main__":
    main()
