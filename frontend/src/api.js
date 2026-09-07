const API_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Ошибка запроса: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function fetchTasks() {
  return request('/tasks');
}

export function getExportCsvUrl() {
  return `${API_URL}/tasks/export/csv`;
}

export function createTask({ title, description }) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });
}

export function updateTaskStatus(id, status) {
  return request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' });
}
