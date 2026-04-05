export default function ThoughtBubble({ content, timestamp }) {
  return (
    <div className="event-enter flex gap-3 py-1">
      <div className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-slate-800/80 border border-slate-700/50
        flex items-center justify-center text-[10px]">
        💭
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-500 text-xs italic leading-relaxed">
          {content}
        </p>
        {timestamp && (
          <p className="text-slate-700 text-[10px] font-mono mt-1">
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
