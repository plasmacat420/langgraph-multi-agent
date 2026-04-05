import TaskInput from "./components/TaskInput.jsx";
import AgentTimeline from "./components/AgentTimeline.jsx";
import OutputPanel from "./components/OutputPanel.jsx";
import { useTasks } from "./hooks/useTasks.js";
import { useTaskStream } from "./hooks/useTaskStream.js";

const AGENT_ORDER = ["planner", "researcher", "executor", "critic"];

const PIPELINE_STEPS = [
  { id: "planner",    label: "Plan",     icon: "🧠" },
  { id: "researcher", label: "Research", icon: "🔍" },
  { id: "executor",   label: "Execute",  icon: "⚡" },
  { id: "critic",     label: "Review",   icon: "🎯" },
];

const STEP_ACTIVE_STYLES = {
  planner:    "bg-purple-500/20  text-purple-300  border-purple-500/40  shadow-[0_0_12px_rgba(168,85,247,0.3)]",
  researcher: "bg-blue-500/20    text-blue-300    border-blue-500/40    shadow-[0_0_12px_rgba(59,130,246,0.3)]",
  executor:   "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]",
  critic:     "bg-amber-500/20   text-amber-300   border-amber-500/40   shadow-[0_0_12px_rgba(245,158,11,0.3)]",
};

function PipelineBar({ events, status }) {
  const agentsSeen = new Set(
    events.filter((e) => AGENT_ORDER.includes(e.agent)).map((e) => e.agent)
  );
  const lastAgent = [...events].reverse().find((e) => AGENT_ORDER.includes(e.agent))?.agent;
  const isComplete = status === "complete";

  return (
    <div className="hidden md:flex items-center gap-1.5">
      {PIPELINE_STEPS.map((step, i) => {
        const isDone   = isComplete || (agentsSeen.has(step.id) && lastAgent !== step.id);
        const isActive = !isComplete && lastAgent === step.id;
        const isPending = !isDone && !isActive;

        return (
          <div key={step.id} className="flex items-center gap-1.5">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-500
                ${isActive  ? STEP_ACTIVE_STYLES[step.id] : ""}
                ${isDone    ? "text-slate-400 border-slate-700/40 bg-slate-800/30" : ""}
                ${isPending ? "text-slate-600 border-transparent" : ""}
              `}
            >
              <span className={isActive ? "animate-pulse" : ""}>{step.icon}</span>
              <span>{step.label}</span>
              {isDone && <span className="text-emerald-400 text-[10px]">✓</span>}
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <span className={`text-xs transition-colors duration-500 ${isDone ? "text-slate-500" : "text-slate-700"}`}>
                ›
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TaskHistoryItem({ task, active, onClick }) {
  const dot = {
    pending:  "bg-yellow-400",
    running:  "bg-blue-400 animate-pulse",
    complete: "bg-emerald-400",
    failed:   "bg-red-400",
  }[task.status] || "bg-slate-600";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all group
        ${active
          ? "bg-white/[0.06] border border-white/[0.08]"
          : "hover:bg-white/[0.03] border border-transparent"
        }`}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
        <span className="text-slate-300 truncate leading-relaxed">{task.task}</span>
      </div>
    </button>
  );
}

export default function App() {
  const { tasks, activeTaskId, submitting, submitError, submit, selectTask } = useTasks();
  const { events, status, finalOutput, error } = useTaskStream(activeTaskId);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="shrink-0 glass border-b border-white/[0.055] px-5 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm shadow-lg shadow-violet-500/20">
            🤖
          </div>
          <div>
            <h1 className="gradient-text font-semibold text-sm leading-tight tracking-tight">
              LangGraph Multi-Agent
            </h1>
            <p className="text-slate-600 text-[10px] font-mono">orchestrator v0.1</p>
          </div>
        </div>

        <PipelineBar events={events} status={status} />

        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500
            ${status === "streaming" || status === "connecting" ? "bg-emerald-400 animate-pulse" : "bg-slate-700"}`}
          />
          <span className="text-slate-600 text-xs font-mono hidden sm:block">
            {status === "streaming" ? "running" : status === "complete" ? "done" : status === "idle" ? "ready" : status}
          </span>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel */}
        <aside className="w-[380px] shrink-0 border-r border-white/[0.05] flex flex-col gap-4 p-4 overflow-y-auto">
          <TaskInput
            onSubmit={submit}
            submitting={submitting}
            streamStatus={status}
          />

          {submitError && (
            <div className="glass rounded-xl px-3 py-2.5 border-red-500/20 bg-red-500/5">
              <p className="text-red-400 text-xs">{submitError}</p>
            </div>
          )}

          {tasks.length > 0 && (
            <div className="space-y-1">
              <p className="text-slate-600 text-[10px] uppercase tracking-widest font-medium px-1 pb-1">
                History
              </p>
              {tasks.map((t) => (
                <TaskHistoryItem
                  key={t.id}
                  task={t}
                  active={t.id === activeTaskId}
                  onClick={() => selectTask(t.id)}
                />
              ))}
            </div>
          )}
        </aside>

        {/* Right panel */}
        <main className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
          {error && (
            <div className="glass rounded-xl px-4 py-3 border-red-500/20 bg-red-500/5">
              <p className="text-red-400 text-sm">⚠ {error}</p>
            </div>
          )}

          <AgentTimeline events={events} status={status} />

          <OutputPanel
            output={finalOutput}
            status={status}
            onNewTask={() => selectTask(null)}
          />
        </main>
      </div>
    </div>
  );
}
