import { useState } from 'react';

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      setError('Название задачи не может быть пустым');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onCreate({ title: title.trim(), description: description.trim() });
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__field">
        <label htmlFor="title">Название</label>
        <input
          id="title"
          type="text"
          placeholder="Изучить React"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="task-form__field">
        <label htmlFor="description">Описание</label>
        <textarea
          id="description"
          placeholder="Пройти базовый курс"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && <p className="task-form__error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Добавляем…' : 'Добавить задачу'}
      </button>
    </form>
  );
}
