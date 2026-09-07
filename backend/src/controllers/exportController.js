const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');


const SCRIPT_PATH = path.join(__dirname, '..', '..', '..', 'python', 'export_tasks.py');

const PYTHON_COMMAND = process.env.PYTHON_COMMAND || 'python';

async function exportTasksCsv(req, res, next) {
  const tempFilePath = path.join(os.tmpdir(), `tasks_export_${Date.now()}.csv`);

  execFile(
    PYTHON_COMMAND,
    [SCRIPT_PATH, '--output', tempFilePath],
    (error, stdout, stderr) => {
      if (error) {
        console.error('Ошибка запуска export_tasks.py:', stderr || error.message);
        return res.status(500).json({
          error: 'Не удалось выполнить экспорт задач. Проверьте, что Python установлен и доступен.',
        });
      }

      res.download(tempFilePath, 'tasks_export.csv', (downloadError) => {
        fs.unlink(tempFilePath, () => {});

        if (downloadError && !res.headersSent) {
          next(downloadError);
        }
      });
    }
  );
}

module.exports = { exportTasksCsv };
