import { Phone, Video } from "lucide-react";
import Avatar from "../ui/Avatar.jsx";
import { formatLastSeen } from "../../utils/formatTime.js";
import { resolveConversationDisplay } from "./ConversationListItem.jsx";
import { useCall } from "../../hooks/useCall.js";

const ChatHeader = ({
  conversation,
  currentUserId,
  onlineUsers,
  typingUsername,
  onDelete,
  extraAction,
}) => {
  const { startCall, callState } = useCall();

  if (!conversation) return null;

  const { name, avatar, userId } = resolveConversationDisplay(
    conversation,
    currentUserId,
  );
  const presence = userId ? onlineUsers?.[userId] : null;
  const isOnline = presence
    ? presence.isOnline
    : resolveConversationDisplay(conversation, currentUserId).online;
  const lastSeen = presence?.lastSeen;

  const canCall = !conversation.isGroup && userId && callState === "idle";

  const handleCall = (type) => {
    if (!canCall) return;
    startCall(
      { id: userId, username: name, profilePic: avatar },
      conversation._id,
      type,
    );
  };

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-5 py-3.5 backdrop-blur">
      <div className="flex items-center gap-3">
        <Avatar src={avatar} name={name} online={isOnline} />
        <div>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className="text-xs text-slate-400">
            {typingUsername ? (
              <span className="text-brand-600">typing...</span>
            ) : isOnline ? (
              "Online"
            ) : (
              formatLastSeen(lastSeen)
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {canCall && (
          <>
            <button
              onClick={() => handleCall("audio")}
              className="grid h-9 w-9 place-items-center rounded-full text-slate-800 transition hover:bg-blue-100"
              title="Voice call"
              aria-label="Start voice call"
            >
              <Phone className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleCall("video")}
              className="grid h-9 w-9 place-items-center rounded-full text-slate-800 transition hover:bg-blue-100"
              title="Video call"
              aria-label="Start video call"
            >
              <Video className="h-4 w-4" />
            </button>
          </>
        )}
        <button
          onClick={onDelete}
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-rose-100 hover:text-rose-600"
        >
          Delete chat
        </button>
        {extraAction}
      </div>
    </div>
  );
};

export default ChatHeader;
