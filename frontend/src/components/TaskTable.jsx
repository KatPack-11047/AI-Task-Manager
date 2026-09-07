const STATUS_LABELS = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Готово',
};

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function TaskTable({ tasks, onStatusChange, onDelete }) {
  if (tasks.length === 0) {
    return <p className="task-table__empty">Задач пока нет — добавьте первую выше.</p>;
  }

  return (
    <table className="task-table">
      <thead>
        <tr>
          <th>Задача</th>
          <th>Статус</th>
          <th>Создано</th>
          <th aria-label="Действия"></th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id} className={`task-row task-row--${task.status}`}>
            <td>
              <div className="task-row__title">{task.title}</div>
              {task.description && (
                <div className="task-row__description">{task.description}</div>
              )}
            </td>
            <td>
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value)}
                className={`status-select status-select--${task.status}`}
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
              >
                Удалить
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
