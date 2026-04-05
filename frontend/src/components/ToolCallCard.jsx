import { useState } from "react";

const TOOL_ICONS = {
  web_search:    "🌐",
  code_executor: "💻",
  file_writer:   "📄",
};

export default function ToolCallCard({ tool, input, output, timestamp }) {
  const [expanded, setExpanded] = useState(false);
  const isLong   = output && output.length > 250;
  const hasError = output && output.toLowerCase().startsWith("error");
  const icon     = TOOL_ICONS[tool] || "🔧";

  return (
    <div className="event-enter glass-dark rounded-xl overflow-hidden">
      {/* Terminal header bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border-b border-white/[0.04]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
        </div>
        <span className="text-[10px] font-mono text-slate-500 ml-1">{icon} {tool || "tool"}</span>
        {timestamp && (
          <span className="ml-auto text-slate-700 text-[10px] font-mono">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="p-3 space-y-2 font-mono">
        {/* Input */}
        {input && (
          <div className="flex gap-2">
            <span className="text-emerald-500 text-xs shrink-0 mt-px">›</span>
            <p className="text-slate-400 text-xs break-all leading-relaxed">{input}</p>
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="flex gap-2">
            <span className={`text-xs shrink-0 mt-px ${hasError ? "text-red-400" : "text-slate-600"}`}>
              {hasError ? "✗" : "·"}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs leading-relaxed break-words whitespace-pre-wrap
                ${hasError ? "text-red-400" : output === "No results found." ? "text-slate-600 italic" : "text-slate-400"}`}>
                {isLong && !expanded ? output.slice(0, 250) + "…" : output}
              </p>
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-blue-400/70 hover:text-blue-400 text-[10px] mt-1 transition-colors"
                >
                  {expanded ? "collapse ↑" : `expand (${output.length} chars) ↓`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
