import { useState } from "react";

const EXAMPLES = [
  "Research the latest developments in MCP protocol and write a summary",
  "Write a Python script that calculates compound interest and explain how it works",
  "Compare LangGraph vs CrewAI for building multi-agent systems",
  "Research voice AI trends and analyze the key players",
];

const STATUS_STYLES = {
  pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  running: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  complete: "bg-green-500/20 text-green-400 border border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border border-red-500/30",
  streaming: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
};

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
      <div>
        <h1 className="text-xl font-bold text-white">LangGraph Multi-Agent</h1>
        <p className="text-slate-400 text-sm mt-1">
          Planner → Researcher → Executor → Critic
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe a complex task for the agents to complete…"
          rows={4}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e);
          }}
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isRunning || !text.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isRunning ? "Running…" : "Run Task"}
          </button>
          {streamStatus && streamStatus !== "idle" && (
            <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[streamStatus] || ""}`}>
              {streamStatus}
            </span>
          )}
        </div>
        <p className="text-slate-600 text-xs">Ctrl+Enter to submit</p>
      </form>

      <div>
        <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider">Example tasks</p>
        <div className="space-y-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setText(ex)}
              disabled={isRunning}
              className="w-full text-left text-xs text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded px-3 py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
