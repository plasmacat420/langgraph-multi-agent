import { useState, useEffect, useRef, useCallback } from "react";
import { streamTask } from "../api/client.js";

export function useTaskStream(taskId) {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("idle");
  const [finalOutput, setFinalOutput] = useState("");
  const [error, setError] = useState(null);
  const esRef = useRef(null);

  const connect = useCallback(() => {
    if (!taskId) return;
    if (esRef.current) {
      esRef.current.close();
    }

    setStatus("connecting");
    const es = streamTask(taskId);
    esRef.current = es;

    es.onopen = () => setStatus("streaming");

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        if (data.type === "heartbeat") return;

        if (data.type === "complete") {
          setStatus(data.status || "complete");
          setFinalOutput(data.final_output || "");
          if (data.error) setError(data.error);
          es.close();
          return;
        }

        if (data.type === "error") {
          setStatus("failed");
          setError(data.content || "Unknown error");
          es.close();
          return;
        }

        setEvents((prev) => [...prev, data]);
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) return;
      setStatus("reconnecting");
      es.close();
      // Reconnect after 3s
      setTimeout(connect, 3000);
    };
  }, [taskId]);

  useEffect(() => {
    if (!taskId) return;
    setEvents([]);
    setFinalOutput("");
    setError(null);
    connect();
    return () => {
      if (esRef.current) esRef.current.close();
    };
  }, [taskId, connect]);

  return { events, status, finalOutput, error };
}
