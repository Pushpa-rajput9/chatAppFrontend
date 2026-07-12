import { useRef, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { uploadsApi } from "../../api/uploads.api.js";

const BACKGROUND_OPTIONS = [
  "#3757ee",
  "#e23744",
  "#059669",
  "#7c3aed",
  "#ea580c",
];

const StatusComposerModal = ({ open, onClose, onPost }) => {
  const [text, setText] = useState("");
  const [background, setBackground] = useState(BACKGROUND_OPTIONS[0]);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef(null);

  const reset = () => {
    setText("");
    setBackground(BACKGROUND_OPTIONS[0]);
    setMediaPreview(null);
    setMediaFile(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
    });
  };

  const handlePost = async () => {
    if (!text.trim() && !mediaFile) return;
    try {
      setPosting(true);
      let mediaUrl = null;
      let mediaType = null;
      if (mediaFile) {
        const res = await uploadsApi.upload(mediaFile);
        mediaUrl = res.data.url;
        mediaType = res.data.mediaType;
      }
      await onPost({
        text: text.trim(),
        mediaUrl,
        mediaType,
        backgroundColor: background,
      });
      handleClose();
    } finally {
      setPosting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add status update">
      <div className="space-y-4">
        {mediaPreview ? (
          <div className="overflow-hidden rounded-xl bg-slate-900">
            {mediaPreview.type === "image" ? (
              <img
                src={mediaPreview.url}
                alt="Status preview"
                className="max-h-72 w-full object-contain"
              />
            ) : (
              <video
                src={mediaPreview.url}
                controls
                className="max-h-72 w-full"
              />
            )}
          </div>
        ) : (
          <div
            className="flex h-40 items-center justify-center rounded-xl p-4 text-center text-lg font-semibold text-white"
            style={{ backgroundColor: background }}
          >
            {text || "What's on your mind?"}
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a caption or text status..."
          rows={2}
          className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />

        {!mediaPreview && (
          <div className="flex items-center gap-2">
            {BACKGROUND_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setBackground(color)}
                className={`h-7 w-7 rounded-full ring-offset-2 ${background === color ? "ring-2 ring-brand-500" : ""}`}
                style={{ backgroundColor: color }}
                aria-label={`Choose background ${color}`}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            📷 Add photo/video
          </button>
          <Button
            onClick={handlePost}
            loading={posting}
            disabled={!text.trim() && !mediaFile}
          >
            Post status
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </Modal>
  );
};

export default StatusComposerModal;
