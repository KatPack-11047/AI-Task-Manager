const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

pool.query('SELECT NOW()')
  .then(() => console.log('✅ Подключение к PostgreSQL успешно установлено'))
  .catch((err) => console.error('❌ Ошибка подключения к PostgreSQL:', err.message));

module.exports = pool;
