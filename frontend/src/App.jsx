import { useEffect, useState } from 'react';
import TaskForm from './components/TaskForm.jsx';
import TaskTable from './components/TaskTable.jsx';
import * as api from './api.js';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.fetchTasks();
      setTasks(data);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(newTask) {
    const created = await api.createTask(newTask);
    setTasks((prev) => [created, ...prev]);
  }

  async function handleStatusChange(id, status) {
    const previous = tasks;

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await api.updateTaskStatus(id, status);
    } catch (err) {
      setLoadError(err.message);
    }
  }

  async function handleDelete(id) {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.deleteTask(id);
    } catch (err) {
      setTasks(previous);
      setLoadError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__logo" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className="topbar__title">AI TASK MANAGER</span>
        </div>
      </header>

      <div className="layout">
        <main className="panel panel--main">
          <div className="panel__header">
            <h1>СПИСОК ЗАДАЧ</h1>
            <div className="panel__header-actions">
              <span className="panel__counter">
                {tasks.length} {tasks.length === 1 ? 'задача' : 'задачи'}
              </span>
              <a
                className="export-button"
                href={api.getExportCsvUrl()}
                download
              >
                Экспорт в CSV
              </a>
            </div>
          </div>

          {loadError && (
            <p className="page__error">
              {loadError} — <button onClick={loadTasks}>повторить</button>
            </p>
          )}

          {loading ? (
            <p className="page__loading">Загружаем задачи…</p>
          ) : (
            <TaskTable
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          )}
        </main>

        <aside className="panel panel--aside">
          <h2>ДОБАВИТЬ НОВУЮ ЗАДАЧУ</h2>
          <TaskForm onCreate={handleCreate} />
        </aside>
      </div>
    </div>
  );
}
