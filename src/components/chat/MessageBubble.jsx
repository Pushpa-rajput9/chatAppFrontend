import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import Avatar from "../ui/Avatar.jsx";
import { formatMessageTime } from "../../utils/formatTime.js";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl.js";

const MessageBubble = ({
  message,
  isOwn,
  showAvatar,
  selectMode,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const seenCount = message.seenBy?.length || 0;

  const handleBubbleClick = () => {
    if (selectMode) onToggleSelect(message._id);
  };

  if (message.isDeleted) {
    return (
      <div
        className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
      >
        {!isOwn && (
          <div className="w-8">
            {showAvatar && (
              <Avatar
                src={message.sender?.profilePic}
                name={message.sender?.username}
                size="sm"
              />
            )}
          </div>
        )}
        <div
          className={`flex max-w-[75%] flex-col ${isOwn ? "items-end" : "items-start"}`}
        >
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-2.5 text-sm italic text-slate-400">
            🚫 This message was deleted
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""} ${selectMode ? "cursor-pointer" : ""}`}
      onClick={handleBubbleClick}
    >
      {selectMode && (
        <input
          type="checkbox"
          checked={Boolean(selected)}
          onChange={() => onToggleSelect(message._id)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 accent-brand-600"
        />
      )}

      {!isOwn && (
        <div className="w-8">
          {showAvatar && (
            <Avatar
              src={message.sender?.profilePic}
              name={message.sender?.username}
              size="sm"
            />
          )}
        </div>
      )}

      <div
        className={`relative flex max-w-[75%] flex-col ${isOwn ? "items-end" : "items-start"}`}
      >
        {message.mediaUrl && (
          <div className="mb-1 overflow-hidden rounded-2xl">
            {message.mediaType === "image" ? (
              <img
                src={resolveMediaUrl(message.mediaUrl)}
                alt="attachment"
                className="max-h-64 max-w-xs object-cover"
              />
            ) : message.mediaType === "video" ? (
              <video
                src={resolveMediaUrl(message.mediaUrl)}
                controls
                className="max-h-64 max-w-xs rounded-2xl"
              />
            ) : message.mediaType === "audio" ? (
              <audio
                src={resolveMediaUrl(message.mediaUrl)}
                controls
                className="h-10 w-64 max-w-full"
              />
            ) : (
              <a
                href={resolveMediaUrl(message.mediaUrl)}
                target="_blank"
                rel="noreferrer"
                className="block bg-slate-100 px-4 py-3 text-sm text-brand-700 underline"
              >
                📎 Attachment
              </a>
            )}
          </div>
        )}

        {message.text && (
          <div
            className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
              isOwn
                ? "rounded-br-md bg-brand-600 text-white"
                : "rounded-bl-md border border-slate-100 bg-white text-slate-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-1 flex items-center gap-1 px-1 text-[10px] text-slate-400">
          <span>{formatMessageTime(message.createdAt)}</span>
          {message.editedAt && <span>· edited</span>}
          {isOwn && <span>{seenCount > 1 ? "✓✓ Seen" : "✓ Sent"}</span>}
        </div>

        {isOwn && !selectMode && (
          <div className="absolute -top-2 right-0 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="grid h-6 w-6 place-items-center rounded-full bg-white text-slate-400 shadow ring-1 ring-slate-100 hover:text-slate-600"
              aria-label="Message options"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-7 z-20 w-32 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                  {message.text && !message.mediaUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit(message);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete(message._id);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
