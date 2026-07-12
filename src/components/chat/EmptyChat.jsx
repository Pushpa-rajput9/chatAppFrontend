import EmptyState from "../ui/EmptyState.jsx";

const EmptyChat = () => (
  <div className="hidden h-full flex-1 items-center justify-center bg-slate-50 md:flex">
    <EmptyState
      icon="💬"
      title="Select a conversation"
      description="Pick a chat from the sidebar or start a new one to begin messaging."
    />
  </div>
);

export default EmptyChat;
