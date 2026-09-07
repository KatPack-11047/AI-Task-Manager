import shutil
import subprocess
import sys
import time
from pathlib import Path


def get_project_root():
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent.parent


PROJECT_ROOT = get_project_root()
BACKEND_DIR = PROJECT_ROOT / "backend"
FRONTEND_DIR = PROJECT_ROOT / "frontend"

sys.path.insert(0, str(Path(__file__).resolve().parent))


def check_command(name):
    return shutil.which(name) is not None


def ensure_node():
    if check_command("node") and check_command("npm"):
        print("[OK] Node.js и npm найдены.")
        return
    print("\n[Внимание] Node.js/npm не найдены в PATH.")
    print("Автоматическая установка Node.js не выполняется намеренно —")
    print("это системный компонент, и ставить его без вашего явного")
    print("подтверждения было бы небезопасно.")
    print("\nСкачайте LTS-версию: https://nodejs.org")
    print("После установки перезапустите этот лаунчер.")
    input("\nНажмите Enter, чтобы закрыть окно...")
    sys.exit(1)


def npm_install_if_needed(project_dir, label):
    node_modules = project_dir / "node_modules"
    if node_modules.exists():
        print(f"[OK] Зависимости {label} уже установлены.")
        return
    print(f"[Setup] Устанавливаю зависимости {label} (npm install)...")
    subprocess.run(["npm", "install"], cwd=str(project_dir), shell=True, check=True)


def ensure_python_export_deps():
    python_cmd = None
    for candidate in ("python", "python3"):
        if check_command(candidate):
            python_cmd = candidate
            break

    if python_cmd is None:
        print("\n[Внимание] Python не найден в PATH — функция экспорта в CSV работать не будет.")
        print("Установите Python: https://www.python.org/downloads/")
        return

    check_script = (
        "import importlib.util, sys; "
        "missing = [p for p in ('psycopg2', 'dotenv') if importlib.util.find_spec(p) is None]; "
        "sys.exit(1 if missing else 0)"
    )
    result = subprocess.run([python_cmd, "-c", check_script])
    if result.returncode == 0:
        print("[OK] Python-зависимости для export_tasks.py уже установлены.")
        return

    print("[Setup] Устанавливаю недостающие Python-библиотеки (psycopg2-binary, python-dotenv)...")
    subprocess.run(
        [python_cmd, "-m", "pip", "install", "psycopg2-binary", "python-dotenv"],
        check=True,
    )


def ensure_env_file():
    env_path = BACKEND_DIR / ".env"
    if env_path.exists():
        print("[OK] backend/.env уже настроен.")
        return

    print("\nФайл backend/.env не найден — запускаю настройку базы данных.\n")
    from db_setup import run_db_setup  # соседний файл tools/db_setup.py
    run_db_setup()


def start_dev_server(project_dir, window_title):
    command = f'title {window_title} && npm run dev'
    return subprocess.Popen(
        ["cmd", "/k", command],
        cwd=str(project_dir),
        creationflags=subprocess.CREATE_NEW_CONSOLE,
    )


def stop_process_tree(pid):
    subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], capture_output=True)


def main():
    print("============================================================")
    print("  AI TASK MANAGER — LAUNCHER")
    print("============================================================\n")

    if not BACKEND_DIR.exists() or not FRONTEND_DIR.exists():
        print(f"[Ошибка] Не нашёл backend/ и frontend/ рядом с этим файлом.")
        print(f"Ожидаемый корень проекта: {PROJECT_ROOT}")
        input("\nНажмите Enter, чтобы закрыть окно...")
        sys.exit(1)

    ensure_node()
    npm_install_if_needed(BACKEND_DIR, "backend")
    npm_install_if_needed(FRONTEND_DIR, "frontend")
    ensure_python_export_deps()
    ensure_env_file()

    print("\nЗапускаю backend и frontend...")
    backend_proc = start_dev_server(BACKEND_DIR, "AI Task Manager - Backend")
    frontend_proc = start_dev_server(FRONTEND_DIR, "AI Task Manager - Frontend")

    time.sleep(3)

    while True:
        print("\n============================================================")
        print("                AI TASK MANAGER РАБОТАЕТ")
        print("============================================================")
        print("\n  Открой в браузере:\n")
        print("      http://localhost:5173\n")
        print("  (backend API работает в фоне на http://localhost:3000)\n")
        print("------------------------------------------------------------")
        command = input("Напиши exit и нажми Enter, чтобы остановить всё: ").strip().lower()
        if command == "exit":
            break

    print("\nОстанавливаю backend и frontend...")
    stop_process_tree(backend_proc.pid)
    stop_process_tree(frontend_proc.pid)
    print("Готово. Можно закрыть это окно.")


if __name__ == "__main__":
    main()
