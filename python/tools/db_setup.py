import sys
from pathlib import Path

try:
    import psycopg2
except ImportError:
    print("Библиотека psycopg2-binary не установлена.")
    print("Установите её командой: pip install psycopg2-binary")
    sys.exit(1)


def get_project_root():
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent.parent


PROJECT_ROOT = get_project_root()
BACKEND_ENV_PATH = PROJECT_ROOT / "backend" / ".env"
INIT_SQL_PATH = PROJECT_ROOT / "backend" / "db" / "init.sql"


def ask(prompt, default):
    value = input(f"{prompt} [{default}]: ").strip()
    return value or default


def database_exists(cursor, db_name):
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (db_name,))
    return cursor.fetchone() is not None


def table_exists(cursor, table_name):
    cursor.execute("SELECT to_regclass(%s);", (f"public.{table_name}",))
    return cursor.fetchone()[0] is not None


def run_db_setup():
    print("=== Настройка базы данных PostgreSQL ===\n")

    host = ask("Хост PostgreSQL", "localhost")
    port = ask("Порт", "5432")
    user = ask("Пользователь (обычно postgres)", "postgres")
    password = ask("Пароль пользователя PostgreSQL", "")
    db_name = ask("Имя базы данных для проекта", "task_manager")

    try:
        admin_conn = psycopg2.connect(
            host=host, port=port, user=user, password=password, dbname="postgres"
        )
    except psycopg2.OperationalError as error:
        print(f"\n[Ошибка] Не удалось подключиться к PostgreSQL: {error}")
        print("Проверьте, что сервер PostgreSQL запущен и что хост/порт/пользователь/пароль верны.")
        sys.exit(1)

    admin_conn.autocommit = True
    with admin_conn.cursor() as cur:
        if database_exists(cur, db_name):
            print(f"\nБаза данных '{db_name}' уже существует — пропускаю создание.")
        else:
            cur.execute(f'CREATE DATABASE "{db_name}";')
            print(f"\nБаза данных '{db_name}' создана.")
    admin_conn.close()

    try:
        target_conn = psycopg2.connect(
            host=host, port=port, user=user, password=password, dbname=db_name
        )
    except psycopg2.OperationalError as error:
        print(f"\n[Ошибка] Не удалось подключиться к базе '{db_name}': {error}")
        sys.exit(1)

    with target_conn:
        with target_conn.cursor() as cur:
            if table_exists(cur, "tasks"):
                print("Таблица 'tasks' уже существует — пропускаю init.sql.")
            elif INIT_SQL_PATH.exists():
                cur.execute(INIT_SQL_PATH.read_text(encoding="utf-8"))
                print("Таблица 'tasks' создана из backend/db/init.sql.")
            else:
                print(f"[Внимание] Файл {INIT_SQL_PATH} не найден, таблица не создана.")
    target_conn.close()

    # Записываем backend/.env
    env_content = (
        "PORT=3000\n\n"
        f"PGHOST={host}\n"
        f"PGPORT={port}\n"
        f"PGDATABASE={db_name}\n"
        f"PGUSER={user}\n"
        f"PGPASSWORD={password}\n"
    )
    BACKEND_ENV_PATH.parent.mkdir(parents=True, exist_ok=True)
    BACKEND_ENV_PATH.write_text(env_content, encoding="utf-8")
    print(f"\nФайл {BACKEND_ENV_PATH} записан.")
    print("\n=== Готово! База данных настроена. ===")


if __name__ == "__main__":
    run_db_setup()
