export default function ThoughtBubble({ content, timestamp }) {
  return (
    <div className="relative ml-2 pl-4 border-l-2 border-slate-700">
      <div className="bg-slate-900/60 rounded-lg px-3 py-2">
        <p className="text-slate-400 text-xs italic leading-relaxed">
          💭 <span>{content}</span>
        </p>
        {timestamp && (
          <p className="text-slate-600 text-xs mt-1">
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
