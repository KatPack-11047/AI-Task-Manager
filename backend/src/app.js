const express = require('express');
const cors = require('cors');

const tasksRouter = require('./routes/tasks');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/tasks', tasksRouter);

// Обработка запросов к несуществующим маршрутам
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Единый обработчик ошибок — все next(err) из контроллеров попадают сюда.
// Это не даёт серверу упасть и возвращает клиенту понятный ответ.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

module.exports = app;
