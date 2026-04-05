import { useState, useCallback } from "react";
import { createTask } from "../api/client.js";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const submit = useCallback(async (taskText) => {
    if (!taskText.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const task = await createTask(taskText.trim());
      setTasks((prev) => [task, ...prev]);
      setActiveTaskId(task.id);
      return task;
    } catch (err) {
      setSubmitError(err.message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const selectTask = useCallback((id) => setActiveTaskId(id), []);

  return { tasks, activeTaskId, submitting, submitError, submit, selectTask };
}
