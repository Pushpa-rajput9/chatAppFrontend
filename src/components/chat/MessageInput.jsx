import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import Button from "../ui/Button.jsx";
import AttachmentMenu from "./AttachmentMenu.jsx";
import EmojiPickerButton from "./EmojiPickerButton.jsx";
import VoiceRecorderButton from "./VoiceRecorderButton.jsx";
import { uploadsApi } from "../../api/uploads.api.js";

const MessageInput = ({
  onSend,
  onTyping,
  onStopTyping,
  disabled,
  extraAction,
  editingMessage,
  onSaveEdit,
  onCancelEdit,
}) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const typingTimeout = useRef(null);

  const isEditing = Boolean(editingMessage);

  useEffect(() => {
    if (editingMessage) setText(editingMessage.text || "");
  }, [editingMessage]);

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping?.();
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onStopTyping?.(), 1200);
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || sending) return;
      try {
        setSending(true);
        if (isEditing) {
          await onSaveEdit(editingMessage._id, trimmed);
        } else {
          setText("");
          onStopTyping?.();
          await onSend(trimmed);
        }
        setText("");
      } finally {
        setSending(false);
      }
    },
    [
      text,
      sending,
      isEditing,
      editingMessage,
      onSaveEdit,
      onSend,
      onStopTyping,
    ],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
    if (e.key === "Escape" && isEditing) {
      onCancelEdit?.();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji);
  };

  const uploadAndSend = useCallback(
    async (fileOrBlob) => {
      try {
        setUploadProgress(0);
        const res = await uploadsApi.upload(fileOrBlob, setUploadProgress);
        const { url, mediaType } = res.data;
        await onSend("", { url, type: mediaType });
      } catch (err) {
        alert(err.message || "Upload failed");
      } finally {
        setUploadProgress(null);
      }
    },
    [onSend],
  );

  return (
    <div className="border-t border-slate-200 bg-white">
      {isEditing && (
        <div className="flex items-center justify-between bg-brand-50 px-4 py-2 text-xs">
          <span className="font-semibold text-brand-700">
            ✏️ Editing message
          </span>
          <button
            type="button"
            onClick={() => {
              setText("");
              onCancelEdit?.();
            }}
            className="rounded-full p-1 text-brand-600 hover:bg-brand-100"
            aria-label="Cancel edit"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {uploadProgress !== null && (
        <div className="h-1 w-full bg-slate-100">
          <div
            className="h-1 bg-brand-500 transition-all"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-1.5 px-4 py-3"
      >
        {!isEditing && extraAction}
        {!isEditing && (
          <AttachmentMenu onFileSelected={uploadAndSend} disabled={disabled} />
        )}
        <EmojiPickerButton onSelect={handleEmojiSelect} disabled={disabled} />
        <textarea
          rows={1}
          autoFocus={isEditing}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={isEditing ? "Edit your message..." : "Type a message..."}
          className="max-h-32 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {isEditing ? (
          <Button
            type="submit"
            disabled={!text.trim()}
            loading={sending}
            className="rounded-full !px-4 !py-2.5"
          >
            ✓
          </Button>
        ) : text.trim() ? (
          <Button
            type="submit"
            disabled={disabled}
            loading={sending}
            className="rounded-full !px-4 !py-2.5"
          >
            ➤
          </Button>
        ) : (
          <VoiceRecorderButton onRecorded={uploadAndSend} disabled={disabled} />
        )}
      </form>
    </div>
  );
};

export default MessageInput;
