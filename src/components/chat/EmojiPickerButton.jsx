import { useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Smile } from "lucide-react";
/**
 * A smiley button that opens an emoji picker popover. Selecting an emoji
 * calls onSelect(emoji) - the caller decides how to insert it (usually
 * appending to the current draft text).
 */
const EmojiPickerButton = ({ onSelect, disabled }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        title="Emoji"
        aria-label="Choose an emoji"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg transition hover:bg-blue-100 disabled:opacity-40"
      >
        <Smile className="h-5 w-5 text-gray-800" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-12 left-0 z-20">
            <EmojiPicker
              theme={Theme.LIGHT}
              width={320}
              height={380}
              onEmojiClick={(emojiData) => onSelect(emojiData.emoji)}
              previewConfig={{ showPreview: false }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default EmojiPickerButton;
