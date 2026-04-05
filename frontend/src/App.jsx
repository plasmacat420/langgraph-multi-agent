import TaskInput from "./components/TaskInput.jsx";
import AgentTimeline from "./components/AgentTimeline.jsx";
import OutputPanel from "./components/OutputPanel.jsx";
import { useTasks } from "./hooks/useTasks.js";
import { useTaskStream } from "./hooks/useTaskStream.js";

function TaskHistoryItem({ task, active, onClick }) {
  const statusColors = {
    pending: "text-yellow-500",
    running: "text-blue-400",
    complete: "text-green-400",
    failed: "text-red-400",
  };
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
        active ? "bg-slate-700 border border-slate-600" : "hover:bg-slate-800/60"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-slate-300 truncate">{task.task}</span>
        <span className={`shrink-0 ${statusColors[task.status] || "text-slate-500"}`}>
          {task.status}
        </span>
      </div>
    </button>
  );
}

export default function App() {
  const { tasks, activeTaskId, submitting, submitError, submit, selectTask } = useTasks();
  const { events, status, finalOutput, error } = useTaskStream(activeTaskId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🤖</span>
          <span className="text-sm font-bold text-white tracking-tight">
            LangGraph Multi-Agent Orchestrator
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>Planner</span>
          <span className="text-slate-700">→</span>
          <span>Researcher</span>
          <span className="text-slate-700">→</span>
          <span>Executor</span>
          <span className="text-slate-700">→</span>
          <span>Critic</span>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="w-[400px] shrink-0 border-r border-slate-800 flex flex-col p-4 gap-5 overflow-y-auto">
          <TaskInput
            onSubmit={submit}
            submitting={submitting}
            streamStatus={status}
          />
          {submitError && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
              Error: {submitError}
            </p>
          )}
          {tasks.length > 0 && (
            <div>
              <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider">Task history</p>
              <div className="space-y-1">
                {tasks.map((t) => (
                  <TaskHistoryItem
                    key={t.id}
                    task={t}
                    active={t.id === activeTaskId}
                    onClick={() => selectTask(t.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right panel */}
        <main className="flex-1 flex flex-col p-5 gap-5 overflow-y-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">Error: {error}</p>
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
