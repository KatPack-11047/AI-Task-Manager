const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/tasksController');
const { exportTasksCsv } = require('../controllers/exportController');

// Экспорт объявлен отдельным GET-маршрутом; конфликтов с PUT/DELETE /:id
// нет, так как это разные HTTP-методы.
router.get('/export/csv', exportTasksCsv);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTaskStatus);
router.delete('/:id', deleteTask);

module.exports = router;
