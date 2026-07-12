const Input = ({ label, error, className = "", ...props }) => (
  <label className="block">
    {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
    <input
      className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 ${
        error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : ""
      } ${className}`}
      {...props}
    />
    {error && <span className="mt-1 block text-xs text-rose-500">{error}</span>}
  </label>
);

export default Input;
