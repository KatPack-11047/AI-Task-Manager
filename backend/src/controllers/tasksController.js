const pool = require('../db/pool');

const ALLOWED_STATUSES = ['new', 'in_progress', 'done'];

async function getTasks(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT id, title, description, status, created_at FROM tasks ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Поле "title" обязательно для заполнения' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status)
       VALUES ($1, $2, 'new')
       RETURNING id, title, description, status, created_at`,
      [title, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateTaskStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Недопустимый статус. Разрешены: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    const result = await pool.query(
      `UPDATE tasks SET status = $1 WHERE id = $2
       RETURNING id, title, description, status, created_at`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Задача с id=${id} не найдена` });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Задача с id=${id} не найдена` });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getTasks, createTask, updateTaskStatus, deleteTask };
