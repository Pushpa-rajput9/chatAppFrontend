const EmptyState = ({ icon = "💬", title, description, action }) => (
  <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
    <div className="text-5xl">{icon}</div>
    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
    {description && <p className="max-w-xs text-sm text-slate-500">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
