# AI Task Manager

Простое веб-приложение для управления задачами (task manager).

## Что делает приложение

- Позволяет создавать задачи (название + описание).
- У каждой задачи есть статус: `new` (новая), `in_progress` (в работе), `done` (готово) — статус можно менять.
- Задачи можно удалять.
- Список задач хранится в базе данных PostgreSQL.
- Есть экспорт всех задач в CSV-файл (кнопка на фронтенде дергает backend, а backend запускает Python-скрипт, который формирует CSV).

![weba_app](https://github.com/KatPack-11047/Images/blob/main/AI%20Task%20Manager/front.png)


Архитектура: React-фронтенд (Vite, порт `5173`) → Express-бэкенд (Node.js, порт `3000`) → PostgreSQL (порт `5432`). Для экспорта в CSV backend отдельно вызывает Python.

## Что должно быть установлено на ПК

| Компонент | Зачем нужен | Проверить командой |
|---|---|---|
| Node.js (LTS) + npm | Запуск backend и frontend | `node -v`, `npm -v` |
| PostgreSQL | Хранение задач | `psql --version` |
| Python 3 | Экспорт задач в CSV | `python --version` |
| Python-пакеты `psycopg2-binary`, `python-dotenv` | Нужны скрипту экспорта | `pip install -r python/requirements.txt` |
*P.S Если некоторые библиотеки не установлены, то программа сама их скачает, но рекомендуется скачать их заранее.*

## Запуск
### Создание базы данных (обязательно для первого запуска)

Для начала работы с приложением вам нужно будет создать и подключить базу данных из PostgreSQL. 


Для этого запустите db_setup.exe и он сам создаст файл, который будет вести к вашей локальной базе данных;

Запустите db_setup.exe и он сам создаст файл, который будет вести к вашей локальной базе данных или программа сама предложит это сделать в запуске launcher.exe если не найдёт базу;

![db_setup](https://github.com/KatPack-11047/Images/blob/main/AI%20Task%20Manager/db_setup.png)

### Ручной способ подключения базы данных
1. **База данных PostgreSQL** должна быть создана и в неё должна быть накатана схема из `backend/db/init.sql`:
   ```
   psql -U postgres -c "CREATE DATABASE task_manager;"
   psql -U postgres -d task_manager -f backend/db/init.sql
   ```

2. **Файл `backend/.env`** — в репозитории его может не быть (или потребуется создать/поправить под себя). Пример содержимого:
   ```
   PORT=3000 

   PGHOST=localhost
   PGPORT=5432 (стандартный порт)
   PGDATABASE=task_manager (название базы данных)
   PGUSER=postgres (или другое имя пользователя)
   PGPASSWORD=ваш_пароль
   ```
   Без этого файла backend не сможет подключиться к базе.

3. **Зависимости Node.js** — ставятся автоматически при первом запуске (или вручную, см. ниже).
### Запуск через launcher

1. Убедиться, что установлены Node.js и (по желанию, для экспорта в CSV) Python.
2. Запустить `launcher.exe` (или `python python/tools/launcher.py`).
3. При первом запуске лаунчер сам:
   - проверит наличие Node.js/npm;
   - выполнит `npm install` в `backend/` и `frontend/`, если `node_modules` ещё нет;
   - проверит Python-зависимости для экспорта;
   - если нет `backend/.env` — запустит настройку базы данных (`db_setup`).
1. Лаунчер откроет два отдельных окна консоли — backend и frontend — и запустит в них `npm run dev`.

| backend                                         | frontend                                        |
| ----------------------------------------------- | ----------------------------------------------- |

| ![back_log](https://github.com/KatPack-11047/Images/blob/main/AI%20Task%20Manager/back_log.png) | ![front_log](https://github.com/KatPack-11047/Images/blob/main/AI%20Task%20Manager/front_log.png) |


1. Открыть в браузере: **http://localhost:5173**
2. Чтобы остановить всё — в окне лаунчера ввести `exit`.

<<<<<<< HEAD
=======
Окно лаунчера:
![launcher](https://github.com/KatPack-11047/Images/blob/main/AI%20Task%20Manager/launcher.png)

### Ручной способ запуска программы

1. Установить зависимости:
   ```
   cd backend
   npm install

   cd ../frontend
   npm install
   ```
2. Создать базу данных и накатить `init.sql` из AI Task Manager\backend\db (см. раздел выше).
3. Создать/проверить `backend/.env`.
4. Запустить backend:
   ```
   cd backend
   npm run dev
   ```
   Должно появиться сообщение `🚀 Сервер запущен на http://localhost:3000`.
5. В отдельном терминале запустить frontend:
   ```
   cd frontend
   npm run dev
   ```
6. Открыть в браузере: **http://localhost:5173**

## Возможные ошибки и что делать

- **Порт 3000 (или 5173) уже занят**
  Ошибка вида `EADDRINUSE: address already in use :::3000`.
  Решение: закрыть процесс, который уже слушает порт, либо сменить порт.
  - Найти процесс на Windows: `netstat -ano | findstr :3000`, затем `taskkill /PID <pid> /F`
  - На Mac/Linux: `lsof -i :3000`, затем `kill -9 <pid>`
  - Либо поменять `PORT` в `backend/.env` (и/или `server.port` в `frontend/vite.config.js`).

- **Не удаётся подключиться к PostgreSQL**
  В консоли backend будет `❌ Ошибка подключения к PostgreSQL: ...`.
  Проверить:
  - запущен ли сам PostgreSQL;
  - правильно ли указаны `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD` в `backend/.env`;
  - создана ли база `task_manager` и накатан ли `init.sql`.

- **Экспорт в CSV не работает / ошибка «Не удалось выполнить экспорт задач»**
  Backend не может найти или запустить Python.
  Проверить:
  - установлен ли Python и доступен ли он в PATH (`python --version`);
  - установлены ли `psycopg2-binary` и `python-dotenv` (`pip install -r python/requirements.txt`);
  - если в системе Python доступен только как `python3`, задать переменную окружения `PYTHON_COMMAND=python3`.

- **Node.js/npm не найдены**
  Лаунчер сообщит об этом и не будет ставить Node.js автоматически (сделано намеренно, из соображений безопасности). Нужно вручную скачать LTS-версию с https://nodejs.org и перезапустить лаунчер.

- **`npm install` зависает или падает с ошибками сети**
  Обычно проблема с доступом к npm registry (прокси/файрвол/VPN). Попробовать `npm install` ещё раз или проверить сетевые настройки/прокси.

- **Фронтенд открывается, но список задач пустой / ошибка запроса**
  Проверить, что backend реально запущен на порту 3000 (адрес зашит в `frontend/src/api.js` как `http://localhost:3000`). Если backend поднят на другом порту — нужно поправить этот файл.

- **CORS-ошибка в консоли браузера**
  Такое возможно, если backend запущен не на порту 3000 или обращение идёт с домена, отличного от `localhost:5173`. Backend уже использует `cors()` без ограничений, так что обычно проблема именно в несовпадении портов.
