const KissButton = ({ onSend, disabled }) => (
  <button
    type="button"
    onClick={onSend}
    disabled={disabled}
    title="Send a kiss"
    aria-label="Send a kiss"
    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg transition hover:bg-rose-100 active:scale-90 disabled:opacity-40"
  >
    💋
  </button>
);

export default KissButton;
