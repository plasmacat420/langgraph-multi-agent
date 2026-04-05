import { useState } from "react";
import ThoughtBubble from "./ThoughtBubble.jsx";
import ToolCallCard from "./ToolCallCard.jsx";

const AGENTS = {
  planner: {
    label:  "Planner",
    badge:  "text-purple-300  bg-purple-500/15  border-purple-500/25",
    dot:    "bg-purple-400",
    card:   "agent-card-planner bg-purple-500/[0.04]",
  },
  researcher: {
    label:  "Researcher",
    badge:  "text-blue-300    bg-blue-500/15    border-blue-500/25",
    dot:    "bg-blue-400",
    card:   "agent-card-researcher bg-blue-500/[0.04]",
  },
  executor: {
    label:  "Executor",
    badge:  "text-emerald-300 bg-emerald-500/15 border-emerald-500/25",
    dot:    "bg-emerald-400",
    card:   "agent-card-executor bg-emerald-500/[0.04]",
  },
  critic: {
    label:  "Critic",
    badge:  "text-amber-300   bg-amber-500/15   border-amber-500/25",
    dot:    "bg-amber-400",
    card:   "agent-card-critic bg-amber-500/[0.04]",
  },
  system: {
    label:  "System",
    badge:  "text-red-300     bg-red-500/15     border-red-500/25",
    dot:    "bg-red-400",
    card:   "agent-card-system bg-red-500/[0.04]",
  },
};

const TYPE_META = {
  thought:  { icon: "💭", label: "thinking"  },
  tool_call:{ icon: "🔧", label: "tool call" },
  output:   { icon: "✅", label: "output"    },
  handoff:  { icon: "→",  label: "handoff"   },
  error:    { icon: "❌", label: "error"     },
};

export default function AgentCard({ event }) {
  const [expanded, setExpanded] = useState(false);
  const ag   = AGENTS[event.agent]  || AGENTS.system;
  const meta = TYPE_META[event.type] || { icon: "•", label: event.type };

  if (event.type === "thought") {
    return <ThoughtBubble content={event.content} timestamp={event.timestamp} />;
  }

  if (event.type === "tool_call") {
    return (
      <ToolCallCard
        tool={event.tool}
        input={event.input}
        output={event.output}
        timestamp={event.timestamp}
      />
    );
  }

  if (event.type === "handoff") {
    return (
      <div className="event-enter flex items-center gap-2 py-1 px-1">
        <div className={`w-1.5 h-1.5 rounded-full ${ag.dot}`} />
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${ag.badge}`}>
          {ag.label}
        </span>
        <span className="text-slate-600 text-xs">→</span>
        <span className="text-slate-500 text-xs">{event.content}</span>
        {event.timestamp && (
          <span className="ml-auto text-slate-700 text-[10px] font-mono shrink-0">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    );
  }

  const isLong = event.content && event.content.length > 320;

  return (
    <div className={`event-enter rounded-xl border border-white/[0.055] overflow-hidden ${ag.card}`}>
      {/* Card header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className={`w-1.5 h-1.5 rounded-full ${ag.dot}`} />
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${ag.badge}`}>
          {ag.label}
        </span>
        <span className="text-sm leading-none">{meta.icon}</span>
        <span className="text-slate-500 text-[10px] capitalize">{meta.label}</span>
        {event.timestamp && (
          <span className="ml-auto text-slate-700 text-[10px] font-mono shrink-0">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Card body */}
      {event.content && (
        <div className="px-3 pb-3">
          <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
            {isLong && !expanded ? event.content.slice(0, 320) + "…" : event.content}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-400/70 hover:text-blue-400 text-[10px] mt-1.5 transition-colors"
            >
              {expanded ? "show less ↑" : "show more ↓"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
