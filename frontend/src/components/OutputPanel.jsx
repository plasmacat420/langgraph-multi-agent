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
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="border border-green-500/30 bg-green-500/5 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-green-500/10 border-b border-green-500/20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-400 text-sm font-medium">Final Output</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
          >
            Download
          </button>
          <button
            onClick={onNewTask}
            className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 px-2 py-1 rounded transition-colors"
          >
            New Task
          </button>
        </div>
      </div>
      <div
        ref={htmlRef}
        className="px-4 py-4 prose-dark text-sm leading-relaxed max-h-[50vh] overflow-y-auto"
      />
    </div>
  );
}
