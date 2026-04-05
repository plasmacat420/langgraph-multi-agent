import { useState } from "react";

const EXAMPLES = [
  { label: "MCP Protocol",     task: "Research the latest developments in MCP protocol and write a detailed summary" },
  { label: "Python Script",    task: "Write a Python script that calculates compound interest and explain how it works" },
  { label: "LangGraph vs CrewAI", task: "Compare LangGraph vs CrewAI for building multi-agent AI systems" },
  { label: "Voice AI Trends",  task: "Research the latest trends in voice AI and analyze the key players" },
];

export default function TaskInput({ onSubmit, submitting, streamStatus }) {
  const [text, setText] = useState("");

  const isRunning = submitting || streamStatus === "streaming" || streamStatus === "connecting";

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || isRunning) return;
    onSubmit(text);
    setText("");
  }

  return (
    <div className="space-y-4">
      {/* Brand mark */}
      <div className="space-y-0.5">
        <p className="text-slate-200 font-semibold text-sm">New Task</p>
        <p className="text-slate-600 text-xs">Describe what you want the agents to research or build.</p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className={`relative rounded-xl transition-all duration-300 ${isRunning ? "opacity-60" : ""}`}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Research the latest AI agent frameworks and write a comparison report…"
            rows={5}
            className="w-full glass rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600
              focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/30
              resize-none leading-relaxed transition-all duration-200"
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e); }}
          />
        </div>

        <button
          type="submit"
          disabled={isRunning || !text.trim()}
          className="relative w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden group
            bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500
            text-white shadow-lg shadow-violet-900/30 hover:shadow-violet-800/40"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isRunning ? (
              <>
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 h-1 bg-white rounded-full"
                      style={{ animation: `dotBounce 1.4s ease-in-out ${i * 0.16}s infinite` }}
                    />
                  ))}
                </span>
                Running agents…
              </>
            ) : (
              <>
                <span>⚡</span> Run Task
              </>
            )}
          </span>
        </button>

        <p className="text-center text-slate-700 text-[10px]">
          ⌘ Enter to submit
        </p>
      </form>

      {/* Example tasks */}
      <div className="space-y-2">
        <p className="text-slate-600 text-[10px] uppercase tracking-widest font-medium">
          Try an example
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => setText(ex.task)}
              disabled={isRunning}
              className="text-left text-xs text-slate-400 hover:text-slate-200
                glass rounded-lg px-3 py-2.5 transition-all duration-200
                hover:bg-white/[0.06] hover:border-white/[0.1]
                disabled:opacity-40 disabled:cursor-not-allowed
                border border-white/[0.04]"
            >
              <span className="font-medium text-slate-300 block mb-0.5">{ex.label}</span>
              <span className="text-slate-600 text-[10px] leading-snug line-clamp-2">{ex.task}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
