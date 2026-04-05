import { useEffect, useRef } from "react";
import AgentCard from "./AgentCard.jsx";

const AGENT_COLORS = {
  planner: "text-purple-400",
  researcher: "text-blue-400",
  executor: "text-green-400",
  critic: "text-amber-400",
};

const AGENT_DOT = {
  planner: "bg-purple-400",
  researcher: "bg-blue-400",
  executor: "bg-green-400",
  critic: "bg-amber-400",
};

const AGENT_LABEL = {
  planner: "Planning subtasks…",
  researcher: "Searching the web…",
  executor: "Writing output…",
  critic: "Reviewing draft…",
};

function ThinkingIndicator({ agent }) {
  if (!agent) return null;
  return (
    <div className="event-enter flex items-center gap-3 px-3 py-2.5 bg-slate-800/40 rounded-lg border border-slate-700/50">
      <span className={`w-2 h-2 rounded-full animate-pulse ${AGENT_DOT[agent] || "bg-slate-400"}`} />
      <span className={`text-sm ${AGENT_COLORS[agent] || "text-slate-400"}`}>
        {AGENT_LABEL[agent] || `${agent} working…`}
      </span>
      <span className="ml-auto flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${AGENT_DOT[agent] || "bg-slate-400"} opacity-40`}
            style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </span>
    </div>
  );
}

export default function AgentTimeline({ events, status }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events, status]);

  const isLive = status === "streaming" || status === "connecting";
  const lastAgent = events[events.length - 1]?.agent;
  const activeAgent = isLive ? lastAgent : null;

  if (events.length === 0 && !isLive) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-600">
        <div className="text-5xl mb-4">🤖</div>
        <p className="text-sm">Submit a task to watch agents work in real time</p>
        <p className="text-xs mt-2 text-slate-700">Planner → Researcher → Executor → Critic</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium text-slate-500 uppercase tracking-widest">
          Agent Activity
        </h2>
        <span className="text-slate-700 text-xs">{events.length} events</span>
      </div>

      <div className="space-y-2 max-h-[62vh] overflow-y-auto pr-1 scroll-smooth">
        {events.map((event, i) => (
          <AgentCard key={i} event={event} />
        ))}

        {isLive && <ThinkingIndicator agent={activeAgent} />}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
