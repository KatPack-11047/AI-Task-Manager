const STATUS_LABELS = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Завершено',
};

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatId(id) {
  return `#${String(id).padStart(3, '0')}`;
}

export default function TaskTable({ tasks, onStatusChange, onDelete }) {
  if (tasks.length === 0) {
    return <p className="task-table__empty">Задач пока нет — добавьте первую справа.</p>;
  }

  return (
    <table className="task-table">
      <thead>
        <tr>
          <th className="task-table__id-col">#</th>
          <th>Заголовок</th>
          <th>Описание</th>
          <th>Статус</th>
          <th>Дата</th>
          <th aria-label="Действия"></th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id} className="task-row">
            <td className="task-row__id">{formatId(task.id)}</td>
            <td className="task-row__title">{task.title}</td>
            <td className="task-row__description">{task.description || '—'}</td>
            <td>
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value)}
                className={`status-pill status-pill--${task.status}`}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </td>
            <td className="task-row__date">{formatDate(task.created_at)}</td>
            <td>
              <button
                type="button"
                className="delete-button"
                onClick={() => onDelete(task.id)}
                aria-label={`Удалить задачу "${task.title}"`}
                title="Удалить"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
