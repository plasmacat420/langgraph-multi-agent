import { useEffect, useRef } from "react";
import AgentCard from "./AgentCard.jsx";

const AGENT_CONFIG = {
  planner:    { color: "text-purple-400",  dot: "bg-purple-400",  glow: "timeline-glow-planner",    msg: "Breaking task into subtopics…" },
  researcher: { color: "text-blue-400",    dot: "bg-blue-400",    glow: "timeline-glow-researcher",  msg: "Searching the web…"             },
  executor:   { color: "text-emerald-400", dot: "bg-emerald-400", glow: "timeline-glow-executor",    msg: "Writing output…"                },
  critic:     { color: "text-amber-400",   dot: "bg-amber-400",   glow: "timeline-glow-critic",      msg: "Reviewing draft…"               },
};

function ThinkingIndicator({ agent }) {
  if (!agent) return null;
  const cfg = AGENT_CONFIG[agent] || { color: "text-slate-400", dot: "bg-slate-400", glow: "", msg: "Working…" };

  return (
    <div className={`event-enter flex items-center gap-3 px-3 py-2.5 glass rounded-xl ${cfg.glow} transition-all duration-700`}>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
            style={{ animation: `dotBounce 1.4s ease-in-out ${i * 0.18}s infinite` }}
          />
        ))}
      </div>
      <span className={`text-sm font-medium ${cfg.color}`}>{cfg.msg}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-72 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20
        border border-white/[0.06] flex items-center justify-center text-3xl mb-5 shadow-xl">
        🤖
      </div>
      <p className="text-slate-300 text-sm font-medium mb-2">Ready to orchestrate</p>
      <p className="text-slate-600 text-xs leading-relaxed max-w-xs">
        Submit a task and watch four specialized AI agents collaborate in real time —
        each thought, search, and revision streamed live.
      </p>
      <div className="flex items-center gap-3 mt-6 text-[10px] text-slate-700">
        <span>🧠 Plan</span>
        <span>›</span>
        <span>🔍 Research</span>
        <span>›</span>
        <span>⚡ Execute</span>
        <span>›</span>
        <span>🎯 Review</span>
      </div>
    </div>
  );
}

export default function AgentTimeline({ events, status }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events, status]);

  const isLive      = status === "streaming" || status === "connecting";
  const activeAgent = isLive ? [...events].reverse().find((e) =>
    ["planner","researcher","executor","critic"].includes(e.agent)
  )?.agent : null;

  if (events.length === 0 && !isLive) return <EmptyState />;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] uppercase tracking-widest font-medium text-slate-600">
          Agent Activity
        </span>
        {events.length > 0 && (
          <span className="text-slate-700 text-[10px] font-mono">{events.length} events</span>
        )}
      </div>

      {/* Feed */}
      <div className="space-y-1.5 max-h-[65vh] overflow-y-auto scroll-smooth pr-0.5">
        {events.map((event, i) => (
          <AgentCard key={i} event={event} />
        ))}
        {isLive && <ThinkingIndicator agent={activeAgent} />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
