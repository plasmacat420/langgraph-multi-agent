const BASE_URL = import.meta.env.VITE_API_URL || "";

export async function createTask(taskText) {
  const res = await fetch(`${BASE_URL}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task: taskText }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getTask(taskId) {
  const res = await fetch(`${BASE_URL}/api/tasks/${taskId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function streamTask(taskId) {
  return new EventSource(`${BASE_URL}/api/tasks/${taskId}/stream`);
}
