import { useEffect, useRef, useState } from "react";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

export default function OutputPanel({ output, status, onNewTask }) {
  const [copied, setCopied] = useState(false);
  const htmlRef = useRef(null);

  useEffect(() => {
    if (htmlRef.current && output) {
      htmlRef.current.innerHTML = marked.parse(output);
    }
  }, [output]);

  if (status !== "complete" || !output) return null;

  function handleCopy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    const blob = new Blob([output], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "output.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="event-enter glass rounded-2xl overflow-hidden
      shadow-[0_0_40px_-8px_rgba(16,185,129,0.15)] border-emerald-500/20">

      {/* Gradient top stripe */}
      <div className="h-[2px] bg-gradient-to-r from-violet-500 via-emerald-500 to-cyan-500" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30
            flex items-center justify-center text-[10px]">
            ✓
          </div>
          <span className="text-sm font-semibold text-slate-200">Final Output</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20
            px-2 py-0.5 rounded-full font-medium">
            Approved by Critic
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300
              glass px-2.5 py-1.5 rounded-lg transition-all hover:bg-white/[0.05]"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300
              glass px-2.5 py-1.5 rounded-lg transition-all hover:bg-white/[0.05]"
          >
            ↓ Download
          </button>
          <button
            onClick={onNewTask}
            className="flex items-center gap-1.5 text-xs font-medium
              bg-gradient-to-r from-violet-600/80 to-blue-600/80 hover:from-violet-500/80 hover:to-blue-500/80
              text-white px-3 py-1.5 rounded-lg transition-all"
          >
            ⚡ New Task
          </button>
        </div>
      </div>

      {/* Rendered markdown */}
      <div
        ref={htmlRef}
        className="prose-dark px-5 py-5 text-sm max-h-[55vh] overflow-y-auto"
      />
    </div>
  );
}
