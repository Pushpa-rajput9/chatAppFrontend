import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckSquare, Trash2, X } from "lucide-react";
import ChatHeader from "./ChatHeader.jsx";
import MessageBubble from "./MessageBubble.jsx";
import MessageInput from "./MessageInput.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import KissButton from "./KissButton.jsx";
import KissOverlay from "./KissOverlay.jsx";
import Spinner from "../ui/Spinner.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import Button from "../ui/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useSocket } from "../../hooks/useSocket.js";
import { useMessages } from "../../hooks/useMessages.js";
import { useConversations } from "../../hooks/useConversations.js";
import { useKiss } from "../../hooks/useKiss.js";
import { resolveConversationDisplay } from "./ConversationListItem.jsx";

const ChatWindow = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const {
    conversations,
    loading: conversationsLoading,
    removeConversation,
    purgeMissingConversation,
  } = useConversations();
  const {
    messages,
    loading,
    notFound,
    sendMessage,
    markSeen,
    editMessage,
    deleteMessage,
    deleteMessages,
  } = useMessages(conversationId);
  const { incomingKiss, sendKiss, clearKiss } = useKiss(conversationId);
  const [typingUsername, setTypingUsername] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const bottomRef = useRef(null);
  const typingClearTimeout = useRef(null);

  const conversation = conversations.find((c) => c._id === conversationId);
  const otherParticipant = conversation
    ? resolveConversationDisplay(conversation, user?.id)
    : null;

  // If the backend tells us this conversation is gone (e.g. the other
  // participant deleted it), drop the stale entry from the shared list too,
  // so the sidebar stops showing it and clicking it again won't dead-end.
  useEffect(() => {
    if (notFound && conversationId) purgeMissingConversation(conversationId);
  }, [notFound, conversationId, purgeMissingConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    messages.forEach((m) => {
      const alreadySeen = m.seenBy?.some(
        (id) => id === user?.id || id?._id === user?.id,
      );
      if (m.sender?._id !== user?.id && !alreadySeen && !m.isDeleted) {
        markSeen(m._id).catch(() => {});
      }
    });
  }, [messages, user?.id, markSeen]);

  useEffect(() => {
    if (!socket) return undefined;
    const handleTyping = ({ conversationId: convoId, username }) => {
      if (convoId !== conversationId) return;
      setTypingUsername(username);
      clearTimeout(typingClearTimeout.current);
      typingClearTimeout.current = setTimeout(
        () => setTypingUsername(null),
        2500,
      );
    };
    const handleStopTyping = ({ conversationId: convoId }) => {
      if (convoId !== conversationId) return;
      setTypingUsername(null);
    };
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, conversationId]);

  const emitTyping = () =>
    socket?.emit("typing", { conversationId, username: user?.username });
  const emitStopTyping = () =>
    socket?.emit("stopTyping", { conversationId, username: user?.username });

  const handleDeleteConversation = async () => {
    if (!confirm("Delete this conversation? This cannot be undone.")) return;
    await removeConversation(conversationId);
    navigate("/chat");
  };

  const toggleSelect = (messageId) => {
    setSelectedIds((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId],
    );
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Delete ${selectedIds.length} message(s)? This cannot be undone.`,
      )
    )
      return;
    await deleteMessages(selectedIds);
    exitSelectMode();
  };

  const handleSingleDelete = async (messageId) => {
    if (!confirm("Delete this message?")) return;
    await deleteMessage(messageId);
  };

  const handleSaveEdit = async (messageId, text) => {
    await editMessage(messageId, text);
    setEditingMessage(null);
  };

  if (notFound || (!conversation && !loading && !conversationsLoading)) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          icon="🔍"
          title="Conversation not found"
          description="This conversation may have been deleted."
          action={
            <Button onClick={() => navigate("/chat")} className="mt-2">
              Back to chats
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col bg-slate-50">
      {selectMode ? (
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5">
          <button
            onClick={exitSelectMode}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600"
          >
            <X className="h-4 w-4" /> {selectedIds.length} selected
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      ) : (
        <ChatHeader
          conversation={conversation}
          currentUserId={user?.id}
          onlineUsers={onlineUsers}
          typingUsername={typingUsername}
          onDelete={handleDeleteConversation}
          extraAction={
            <button
              onClick={() => setSelectMode(true)}
              className="grid h-9 w-9 place-items-center rounded-full text-slate-800 transition hover:bg-blue-100"
              title="Select messages"
              aria-label="Select messages"
            >
              <CheckSquare className="h-4 w-4" />
            </button>
          }
        />
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner label="Loading messages..." />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon="👋"
            title="No messages yet"
            description="Send the first message to break the ice."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message, idx) => {
              const isOwn = message.sender?._id === user?.id;
              const prev = messages[idx - 1];
              const showAvatar =
                !prev || prev.sender?._id !== message.sender?._id;
              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  selectMode={selectMode}
                  selected={selectedIds.includes(message._id)}
                  onToggleSelect={toggleSelect}
                  onEdit={setEditingMessage}
                  onDelete={handleSingleDelete}
                />
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <TypingIndicator username={typingUsername} />
      <MessageInput
        onSend={sendMessage}
        onTyping={emitTyping}
        onStopTyping={emitStopTyping}
        extraAction={<KissButton onSend={sendKiss} />}
        editingMessage={editingMessage}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={() => setEditingMessage(null)}
      />

      <KissOverlay
        visible={Boolean(incomingKiss)}
        fromUser={{
          username: incomingKiss?.fromUsername,
          profilePic: otherParticipant?.avatar,
        }}
        toUser={{ username: user?.username, profilePic: user?.profilePic }}
        onDone={clearKiss}
      />
    </div>
  );
};

export default ChatWindow;
