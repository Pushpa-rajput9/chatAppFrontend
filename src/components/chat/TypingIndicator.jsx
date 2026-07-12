const TypingIndicator = ({ username }) => {
  if (!username) return null;

  return (
    <div className="flex items-center gap-2 px-5 pb-2 text-xs text-slate-400">
      <div className="flex items-center gap-1 rounded-2xl bg-white px-3 py-2 shadow-sm">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" style={{ animationDelay: "0s" }} />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" style={{ animationDelay: "0.15s" }} />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" style={{ animationDelay: "0.3s" }} />
      </div>
      <span>{username} is typing</span>
    </div>
  );
};

export default TypingIndicator;
