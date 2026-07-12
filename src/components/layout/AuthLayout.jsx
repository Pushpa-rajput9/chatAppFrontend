const AuthLayout = ({ title, subtitle, children }) => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4">
    <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-soft md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-white md:flex">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-lg">💬</span>
          ConvoSphere
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">Conversations,{"\n"}beautifully connected.</h2>
          <p className="mt-3 text-sm text-brand-100">
            Real-time messaging with presence, typing indicators and a clean, focused UI.
          </p>
        </div>
        <p className="text-xs text-brand-200">© {new Date().getFullYear()} ConvoSphere</p>
      </div>
      <div className="p-8 sm:p-10">
        <div className="mb-8 md:hidden flex items-center gap-2 text-lg font-bold text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">💬</span>
          ConvoSphere
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
