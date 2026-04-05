import { useEffect, useRef } from "react";
import AgentCard from "./AgentCard.jsx";

const AGENT_COLORS = {
  planner: "text-purple-400",
  researcher: "text-blue-400",
  executor: "text-green-400",
  critic: "text-amber-400",
};

const AGENT_DOT_COLORS = {
  planner: "bg-purple-400",
  researcher: "bg-blue-400",
  executor: "bg-green-400",
  critic: "bg-amber-400",
};

function ActiveAgentIndicator({ agent }) {
  if (!agent) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
      <span
        className={`w-2.5 h-2.5 rounded-full animate-pulse ${AGENT_DOT_COLORS[agent] || "bg-slate-400"}`}
      />
      <span className={`text-sm font-medium capitalize ${AGENT_COLORS[agent] || "text-slate-400"}`}>
        {agent} agent active…
      </span>
    </div>
  );
}

export default function AgentTimeline({ events, status }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  const activeAgent =
    status === "streaming" || status === "connecting"
      ? events[events.length - 1]?.agent
      : null;

  if (events.length === 0 && status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-600">
        <span className="text-4xl mb-3">🤖</span>
        <p className="text-sm">Submit a task to watch agents work in real time</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-300 uppercase tracking-wider">
          Agent Activity
        </h2>
        <span className="text-slate-600 text-xs">{events.length} events</span>
      </div>

      {activeAgent && <ActiveAgentIndicator agent={activeAgent} />}

      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {events.map((event, i) => (
          <AgentCard key={i} event={event} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
