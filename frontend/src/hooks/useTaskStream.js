import { useState, useEffect, useRef, useCallback } from "react";
import { streamTask } from "../api/client.js";

const EVENT_DRIP_MS = 350; // delay between rendering each event

export function useTaskStream(taskId) {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("idle");
  const [finalOutput, setFinalOutput] = useState("");
  const [error, setError] = useState(null);

  const esRef = useRef(null);
  const queueRef = useRef([]);           // raw events waiting to be shown
  const timerRef = useRef(null);         // drip timer
  const completionRef = useRef(null);    // pending complete payload

  // Drip one event from the queue into visible state
  const drip = useCallback(() => {
    if (queueRef.current.length === 0) {
      // Queue empty — if we have a pending completion, fire it now
      if (completionRef.current) {
        const c = completionRef.current;
        completionRef.current = null;
        setStatus(c.status || "complete");
        setFinalOutput(c.final_output || "");
        if (c.error) setError(c.error);
      }
      timerRef.current = null;
      return;
    }
    const next = queueRef.current.shift();
    setEvents((prev) => [...prev, next]);
    timerRef.current = setTimeout(drip, EVENT_DRIP_MS);
  }, []);

  const connect = useCallback(() => {
    if (!taskId) return;
    if (esRef.current) esRef.current.close();

    queueRef.current = [];
    completionRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);

    setStatus("connecting");
    const es = streamTask(taskId);
    esRef.current = es;

    es.onopen = () => setStatus("streaming");

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "heartbeat") return;

        if (data.type === "complete") {
          // Don't show complete until queue drains
          completionRef.current = data;
          es.close();
          // Kick drip if not already running
          if (!timerRef.current) timerRef.current = setTimeout(drip, EVENT_DRIP_MS);
          return;
        }

        if (data.type === "error") {
          setStatus("failed");
          setError(data.content || "Unknown error");
          es.close();
          return;
        }

        // Enqueue and start dripping if not already
        queueRef.current.push(data);
        if (!timerRef.current) timerRef.current = setTimeout(drip, EVENT_DRIP_MS);
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) return;
      setStatus("reconnecting");
      es.close();
      setTimeout(connect, 3000);
    };
  }, [taskId, drip]);

  useEffect(() => {
    if (!taskId) return;
    setEvents([]);
    setFinalOutput("");
    setError(null);
    connect();
    return () => {
      if (esRef.current) esRef.current.close();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [taskId, connect]);

  return { events, status, finalOutput, error };
}
