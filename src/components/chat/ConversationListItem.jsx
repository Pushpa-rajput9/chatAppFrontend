import Avatar from "../ui/Avatar.jsx";
import { formatConversationTime } from "../../utils/formatTime.js";

/**
 * Resolves the "other person" (or group name) to display for a conversation,
 * given the logged-in user's id.
 */
export const resolveConversationDisplay = (conversation, currentUserId) => {
  if (conversation.isGroup) {
    return {
      name: conversation.name || "Group chat",
      avatar: conversation.groupAvatar,
      online: false,
    };
  }
  const participants = conversation.participantsInfo?.length
    ? conversation.participantsInfo
    : conversation.participants;
  const other =
    participants?.find((p) => (p._id || p) !== currentUserId) ||
    participants?.[0];
  return {
    name: other?.username || other?.identifier || "Unknown user",
    avatar: other?.profilePic,
    online: other?.isOnline,
    userId: other?._id,
  };
};

const ConversationListItem = ({
  conversation,
  currentUserId,
  active,
  onClick,
}) => {
  const { name, avatar, online } = resolveConversationDisplay(
    conversation,
    currentUserId,
  );
  const lastMessage = conversation.lastMessageInfo;
  const preview = lastMessage
    ? lastMessage.mediaType
      ? `📎 ${lastMessage.mediaType}`
      : lastMessage.text
    : "Say hello 👋";

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
        active ? "bg-brand-50 ring-1 ring-brand-100" : "hover:bg-slate-100"
      }`}
    >
      <Avatar src={avatar} name={name} online={online} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-slate-800">
            {name}
          </p>
          <span className="shrink-0 text-[11px] text-slate-400">
            {formatConversationTime(conversation.updatedAt)}
          </span>
        </div>
        <p className="truncate text-xs text-slate-500">{preview}</p>
      </div>
    </button>
  );
};

export default ConversationListItem;
