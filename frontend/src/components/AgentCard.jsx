import { useState } from "react";
import ThoughtBubble from "./ThoughtBubble.jsx";
import ToolCallCard from "./ToolCallCard.jsx";

const AGENT_STYLES = {
  planner: {
    bg: "bg-purple-500/10 border-purple-500/30",
    badge: "bg-purple-500/20 text-purple-300",
    dot: "bg-purple-400",
    label: "Planner",
  },
  researcher: {
    bg: "bg-blue-500/10 border-blue-500/30",
    badge: "bg-blue-500/20 text-blue-300",
    dot: "bg-blue-400",
    label: "Researcher",
  },
  executor: {
    bg: "bg-green-500/10 border-green-500/30",
    badge: "bg-green-500/20 text-green-300",
    dot: "bg-green-400",
    label: "Executor",
  },
  critic: {
    bg: "bg-amber-500/10 border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-300",
    dot: "bg-amber-400",
    label: "Critic",
  },
  system: {
    bg: "bg-red-500/10 border-red-500/30",
    badge: "bg-red-500/20 text-red-300",
    dot: "bg-red-400",
    label: "System",
  },
};

const TYPE_ICONS = {
  thought: "💭",
  tool_call: "🔧",
  output: "✅",
  handoff: "→",
  error: "❌",
};

export default function AgentCard({ event }) {
  const [expanded, setExpanded] = useState(false);
  const style = AGENT_STYLES[event.agent] || AGENT_STYLES.system;
  const icon = TYPE_ICONS[event.type] || "•";

  if (event.type === "thought") {
    return (
      <div className="event-enter">
        <ThoughtBubble content={event.content} timestamp={event.timestamp} />
      </div>
    );
  }

  if (event.type === "tool_call") {
    return (
      <div className="event-enter">
        <ToolCallCard
          tool={event.tool}
          input={event.input}
          output={event.output}
          timestamp={event.timestamp}
        />
      </div>
    );
  }

  const isLong = event.content && event.content.length > 300;

  return (
    <div className={`event-enter border rounded-lg overflow-hidden ${style.bg}`}>
      <div className="flex items-center gap-2 px-3 py-2">
        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
          {style.label}
        </span>
        <span className="text-sm">{icon}</span>
        <span className="text-slate-400 text-xs capitalize">{event.type}</span>
        {event.timestamp && (
          <span className="ml-auto text-slate-600 text-xs">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
      {event.content && (
        <div className="px-3 pb-3">
          <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
            {isLong && !expanded ? event.content.slice(0, 300) + "…" : event.content}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-400 hover:text-blue-300 text-xs mt-1"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
