import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Avatar from "../ui/Avatar.jsx";
import Spinner from "../ui/Spinner.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import ConversationListItem, {
  resolveConversationDisplay,
} from "./ConversationListItem.jsx";
import NewChatModal from "./NewChatModal.jsx";
import NewGroupModal from "./NewGroupModal.jsx";
import StatusTab from "../status/StatusTab.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useConversations } from "../../hooks/useConversations.js";
import { MessageCirclePlus, MessageSquarePlus } from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { conversations, loading, createConversation } = useConversations();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "status"
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter((c) => {
      const { name } = resolveConversationDisplay(c, user?.id);
      return name.toLowerCase().includes(q);
    });
  }, [conversations, query, user?.id]);

  const handleStartChat = async (targetUserId) => {
    const conversation = await createConversation([targetUserId]);
    setChatModalOpen(false);
    navigate(`/chat/${conversation._id}`);
  };

  const handleCreateGroup = async (participantIds, name) => {
    const conversation = await createConversation(participantIds, {
      isGroup: true,
      name,
    });
    setGroupModalOpen(false);
    navigate(`/chat/${conversation._id}`);
  };

  return (
    <aside className="flex h-full w-full max-w-sm flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
        <div className="flex items-center gap-2 text-lg font-bold text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white text-sm">
            💬
          </span>
          ConvoSphere
        </div>
        <div className="relative">
          <button
            onClick={() => setAddMenuOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-700 transition hover:bg-brand-100"
            title="Start something new"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </button>
          {addMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setAddMenuOpen(false)}
              />
              <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-xl">
                <button
                  onClick={() => {
                    setAddMenuOpen(false);
                    setChatModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  💬 New chat
                </button>
                <button
                  onClick={() => {
                    setAddMenuOpen(false);
                    setGroupModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  👥 New group
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-100 px-3 pt-2">
        {[
          { key: "chats", label: "Chats" },
          { key: "status", label: "Status" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "border-b-2 border-brand-600 text-brand-700"
                : "border-b-2 border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "status" ? (
        <StatusTab />
      ) : (
        <>
          <div className="px-4 py-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-3">
            {loading ? (
              <div className="py-10">
                <Spinner label="Loading chats..." />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="🗨️"
                title="No conversations yet"
                description="Start a new chat to say hello to someone."
              />
            ) : (
              <div className="flex flex-col gap-1">
                {filtered.map((conversation) => (
                  <ConversationListItem
                    key={conversation._id}
                    conversation={conversation}
                    currentUserId={user?.id}
                    active={conversation._id === conversationId}
                    onClick={() => navigate(`/chat/${conversation._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar src={user?.profilePic} name={user?.username} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.username}
            </p>
            <p className="truncate text-xs text-slate-400">
              {user?.identifier}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
        >
          Log out
        </button>
      </div>

      <NewChatModal
        open={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        onSelect={handleStartChat}
      />
      <NewGroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onCreate={handleCreateGroup}
      />
    </aside>
  );
};

export default Sidebar;
