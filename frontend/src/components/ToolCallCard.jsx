import { useState } from "react";

export default function ToolCallCard({ tool, input, output, timestamp }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = output && output.length > 200;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <span className="text-base">🔧</span>
          <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
            {tool || "tool"}
          </span>
        </div>
        {timestamp && (
          <span className="text-slate-600 text-xs">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="px-3 py-2 space-y-2">
        {input && (
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Input</p>
            <p className="text-slate-300 text-xs font-mono bg-slate-800/50 px-2 py-1 rounded">
              {input}
            </p>
          </div>
        )}
        {output && (
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Output</p>
            <div className="text-slate-300 text-xs font-mono bg-slate-800/50 px-2 py-1 rounded whitespace-pre-wrap">
              {isLong && !expanded ? output.slice(0, 200) + "…" : output}
            </div>
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
    </div>
  );
}
