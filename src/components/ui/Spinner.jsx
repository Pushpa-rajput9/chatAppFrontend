const Spinner = ({ className = "h-6 w-6", label }) => (
  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    {label && <span className="text-xs">{label}</span>}
  </div>
);

export default Spinner;
